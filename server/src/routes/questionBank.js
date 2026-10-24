import { Router } from 'express'
import { getCategories, listQuestions, getQuestion, listAllWithAnswers } from '../data/questionBank.js'

const router = Router()

router.get('/categories', (_req, res) => {
  res.json({ categories: getCategories() })
})

// Full dataset including answers, for the client to cache for offline practice.
router.get('/export', (_req, res) => {
  res.json({ questions: listAllWithAnswers() })
})

router.get('/', (req, res) => {
  const { category, difficulty } = req.query
  res.json({ questions: listQuestions({ category, difficulty }) })
})

router.get('/:id', (req, res) => {
  const question = getQuestion(req.params.id)
  if (!question) return res.status(404).json({ error: 'Question not found.' })
  res.json(question)
})

export default router
