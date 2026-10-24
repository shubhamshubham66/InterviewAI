import { Router } from 'express'
import { listProblems, getProblem } from '../data/codingProblems.js'
import { runTests } from '../services/codeRunner.js'
import { reviewCode } from '../services/ai.js'
import { recordResult } from '../services/results.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()
router.use(optionalAuth)

router.get('/problems', (_req, res) => {
  res.json({ problems: listProblems() })
})

router.get('/problems/:id', (req, res) => {
  const problem = getProblem(req.params.id)
  if (!problem) return res.status(404).json({ error: 'Problem not found.' })
  const { hiddenTestCases, ...publicProblem } = problem
  res.json(publicProblem)
})

router.post('/problems/:id/run', async (req, res) => {
  const problem = getProblem(req.params.id)
  if (!problem) return res.status(404).json({ error: 'Problem not found.' })

  const { code, role } = req.body || {}
  const allTestCases = [...problem.examples, ...problem.hiddenTestCases]

  const run = await runTests({ code, entryFunction: problem.entryFunction, testCases: allTestCases })
  const results = run.results || []

  const visibleResults = results.slice(0, problem.examples.length).map((r) => ({ ...r, hidden: false }))
  const hiddenSummary = results.slice(problem.examples.length).map((r) => ({ passed: r.passed, hidden: true }))

  let feedback = null
  if (!run.error && !run.compileError) {
    const review = await reviewCode({ role: role || 'SDE Intern', problemTitle: problem.title, code, allPassed: run.allPassed })
    feedback = review.feedback
  }

  if (results.length && req.user) {
    recordResult({
      userId: req.user.id,
      kind: 'coding',
      role: role || 'SDE Intern',
      interviewType: problem.title,
      difficulty: problem.difficulty,
      averageScore: Math.round((results.filter((r) => r.passed).length / results.length) * 10 * 10) / 10,
    })
  }

  res.json({
    allPassed: Boolean(run.allPassed),
    error: run.error || run.compileError || null,
    timedOut: Boolean(run.timedOut),
    visibleResults,
    hiddenSummary,
    passedCount: results.filter((r) => r.passed).length,
    totalCount: results.length,
    feedback,
  })
})

export default router
