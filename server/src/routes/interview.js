import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { createSession, getSession, updateSession, deleteSession } from '../store/sessions.js'
import { generateQuestion, evaluateAnswer, improveAnswer, aiEnabled } from '../services/ai.js'
import { analyzeSpeech } from '../services/speechCoach.js'
import { recordResult } from '../services/results.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()
router.use(optionalAuth)
const MAX_QUESTIONS = 5

const ROLES = ['SDE Intern', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'HR Round', 'Core EIE / ECE']
const TYPES = ['Technical', 'Behavioral', 'HR']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

router.get('/meta', (_req, res) => {
  res.json({ roles: ROLES, types: TYPES, difficulties: DIFFICULTIES, aiEnabled })
})

router.post('/start', async (req, res) => {
  const { role, interviewType, difficulty, resumeContext } = req.body || {}

  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Unknown role.' })
  if (!TYPES.includes(interviewType)) return res.status(400).json({ error: 'Unknown interview type.' })
  if (!DIFFICULTIES.includes(difficulty)) return res.status(400).json({ error: 'Unknown difficulty.' })

  const history = []
  const question = await generateQuestion({ role, interviewType, difficulty, resumeContext, history })
  history.push({ role: 'interviewer', text: question.question })

  const session = createSession({
    id: uuid(),
    role,
    interviewType,
    difficulty,
    resumeContext: resumeContext || '',
    history,
    turns: [],
    userId: req.user?.id || null,
  })

  res.json({ sessionId: session.id, question: question.question, isFollowUp: false, aiEnabled })
})

function computeAdaptiveHint(turns) {
  if (!turns.length) return 'maintain'
  const last = turns[turns.length - 1].evaluation.score
  if (last < 5) return 'reinforce'
  const recent = turns.slice(-2).map((t) => t.evaluation.score)
  if (recent.length === 2 && recent.every((s) => s >= 7.5)) return 'increase'
  return 'maintain'
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

  const askedCount = session.turns.length
  if (askedCount >= MAX_QUESTIONS) {
    const report = buildReport(session)
    updateSession(sessionId, (s) => {
      s.turns = session.turns
      s.history = session.history
      s.completed = true
    })
    recordResult({
      userId: session.userId,
      kind: 'interview',
      role: session.role,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      averageScore: report.averageScore,
    })
    return res.json({ evaluation, speechCoach, done: true, report })
  }

  const next = await generateQuestion({
    role: session.role,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
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
    adaptiveHint,
  })
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
  const scores = session.turns.map((t) => Number(t.evaluation.score) || 0)
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  return {
    role: session.role,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    averageScore: Math.round(average * 10) / 10,
    turns: session.turns,
  }
}

export default router
