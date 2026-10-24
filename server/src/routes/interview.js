import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { createSession, getSession, updateSession, deleteSession } from '../store/sessions.js'
import { generateQuestion, evaluateAnswer, improveAnswer, aiEnabled } from '../services/ai.js'
import { analyzeSpeech } from '../services/speechCoach.js'
import { recordResult } from '../services/results.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()
router.use(optionalAuth)

const ROLES = ['SDE Intern', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'HR Round', 'Core EIE / ECE']
const TYPES = ['Technical', 'Behavioral', 'HR']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const DURATIONS = { 10: 3, 15: 5, 20: 7, 30: 10 }
const DEFAULT_DURATION = 15

router.get('/meta', (_req, res) => {
  res.json({ roles: ROLES, types: TYPES, difficulties: DIFFICULTIES, durations: Object.keys(DURATIONS).map(Number), aiEnabled })
})

router.post('/start', async (req, res) => {
  const { role, interviewType, difficulty, resumeContext, company, duration } = req.body || {}

  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Unknown role.' })
  if (!TYPES.includes(interviewType)) return res.status(400).json({ error: 'Unknown interview type.' })
  if (!DIFFICULTIES.includes(difficulty)) return res.status(400).json({ error: 'Unknown difficulty.' })

  const maxQuestions = DURATIONS[duration] || DURATIONS[DEFAULT_DURATION]
  const companyName = (company || '').trim().slice(0, 80)

  const history = []
  const question = await generateQuestion({ role, interviewType, difficulty, company: companyName, resumeContext, history })
  history.push({ role: 'interviewer', text: question.question })

  const session = createSession({
    id: uuid(),
    role,
    interviewType,
    difficulty,
    company: companyName,
    resumeContext: resumeContext || '',
    history,
    turns: [],
    maxQuestions,
    userId: req.user?.id || null,
  })

  res.json({ sessionId: session.id, question: question.question, isFollowUp: false, maxQuestions, aiEnabled })
})

function computeAdaptiveHint(turns) {
  const scored = turns.filter((t) => t.evaluation)
  if (!scored.length) return 'maintain'
  const last = scored[scored.length - 1].evaluation.score
  if (last < 5) return 'reinforce'
  const recent = scored.slice(-2).map((t) => t.evaluation.score)
  if (recent.length === 2 && recent.every((s) => s >= 7.5)) return 'increase'
  return 'maintain'
}

async function advanceOrFinish(req, res, session, { evaluation = null, speechCoach = null, adaptiveHint = 'maintain' } = {}) {
  const sessionId = session.id
  const askedCount = session.turns.length

  if (askedCount >= session.maxQuestions) {
    return finishInterview(req, res, session, { evaluation, speechCoach })
  }

  const next = await generateQuestion({
    role: session.role,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    company: session.company,
    resumeContext: session.resumeContext,
    history: session.history,
    adaptiveHint,
  })
  session.history.push({ role: 'interviewer', text: next.question })

  updateSession(sessionId, (s) => {
    s.turns = session.turns
    s.history = session.history
  })

  res.json({
    evaluation,
    speechCoach,
    done: false,
    question: next.question,
    isFollowUp: Boolean(next.isFollowUp),
    adaptiveHint: adaptiveHint !== 'maintain' ? adaptiveHint : null,
  })
}

function finishInterview(req, res, session, { evaluation = null, speechCoach = null } = {}) {
  const report = buildReport(session)
  updateSession(session.id, (s) => {
    s.turns = session.turns
    s.history = session.history
    s.completed = true
  })
  if (report.turns.some((t) => t.evaluation)) {
    recordResult({
      userId: session.userId,
      kind: 'interview',
      role: session.role,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      averageScore: report.averageScore,
    })
  }
  res.json({ evaluation, speechCoach, done: true, report })
}

router.post('/answer', async (req, res) => {
  const { sessionId, answer, durationSeconds } = req.body || {}
  const session = getSession(sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found or expired. Start a new interview.' })
  if (!answer || !answer.trim()) return res.status(400).json({ error: 'Answer cannot be empty.' })

  const lastQuestion = [...session.history].reverse().find((h) => h.role === 'interviewer')?.text

  const evaluation = await evaluateAnswer({ role: session.role, question: lastQuestion, answer })
  const speechCoach = analyzeSpeech({ transcript: answer, durationSeconds: Number(durationSeconds) || 0 })

  session.turns.push({ question: lastQuestion, answer, evaluation, speechCoach })
  session.history.push({ role: 'candidate', text: answer })

  const adaptiveHint = computeAdaptiveHint(session.turns)
  await advanceOrFinish(req, res, session, { evaluation, speechCoach, adaptiveHint })
})

// Real-time control: skip the current question without answering it. The
// skipped turn is kept in the report for visibility but excluded from scoring.
router.post('/skip', async (req, res) => {
  const { sessionId } = req.body || {}
  const session = getSession(sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found or expired. Start a new interview.' })

  const lastQuestion = [...session.history].reverse().find((h) => h.role === 'interviewer')?.text
  session.turns.push({ question: lastQuestion, answer: null, evaluation: null, skipped: true })
  session.history.push({ role: 'candidate', text: '(skipped)' })

  await advanceOrFinish(req, res, session, {})
})

// Real-time control: end the interview early and get a report for whatever was answered.
router.post('/end', (req, res) => {
  const { sessionId } = req.body || {}
  const session = getSession(sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found or expired.' })
  finishInterview(req, res, session, {})
})

router.post('/improve', async (req, res) => {
  const { role, question, answer } = req.body || {}
  if (!role || !question || !answer) {
    return res.status(400).json({ error: 'role, question and answer are required.' })
  }
  const improved = await improveAnswer({ role, question, answer })
  res.json(improved)
})

router.get('/:sessionId/report', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found or expired.' })
  res.json(buildReport(session))
})

router.delete('/:sessionId', (req, res) => {
  deleteSession(req.params.sessionId)
  res.status(204).end()
})

function buildReport(session) {
  const scored = session.turns.filter((t) => t.evaluation)
  const scores = scored.map((t) => Number(t.evaluation.score) || 0)
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  return {
    role: session.role,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    company: session.company || '',
    averageScore: Math.round(average * 10) / 10,
    turns: session.turns,
  }
}

export default router
