import express from 'express'
import cors from 'cors'
import interviewRouter from './routes/interview.js'
import resumeRouter from './routes/resume.js'
import codingRouter from './routes/coding.js'
import questionBankRouter from './routes/questionBank.js'
import { aiEnabled } from './services/ai.js'

const app = express()
const PORT = process.env.PORT || 8787
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiEnabled })
})

app.use('/api/interview', interviewRouter)
app.use('/api/resume', resumeRouter)
app.use('/api/coding', codingRouter)
app.use('/api/question-bank', questionBankRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`InterviewAI server listening on :${PORT} (AI ${aiEnabled ? 'enabled' : 'in mock mode — set ANTHROPIC_API_KEY'})`)
})
