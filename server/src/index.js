import http from 'http'
import express from 'express'
import cors from 'cors'
import interviewRouter from './routes/interview.js'
import resumeRouter from './routes/resume.js'
import codingRouter from './routes/coding.js'
import questionBankRouter from './routes/questionBank.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import peerRouter from './routes/peer.js'
import profileRouter from './routes/profile.js'
import { aiEnabled } from './services/ai.js'
import { attachPeerWebSocket } from './ws/peerServer.js'
import './db/index.js'

const app = express()
const PORT = process.env.PORT || 8787
// Comma-separated list so multiple frontend domains (prod + preview, etc.) can all call this API.
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim())

app.use(cors({ origin: CORS_ORIGINS }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiEnabled })
})

app.use('/api/auth', authRouter)
app.use('/api/interview', interviewRouter)
app.use('/api/resume', resumeRouter)
app.use('/api/coding', codingRouter)
app.use('/api/question-bank', questionBankRouter)
app.use('/api/admin', adminRouter)
app.use('/api/peer', peerRouter)
app.use('/api/profile', profileRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const server = http.createServer(app)
attachPeerWebSocket(server)

server.listen(PORT, () => {
  console.log(`InterviewAI server listening on :${PORT} (AI ${aiEnabled ? 'enabled' : 'in mock mode — set ANTHROPIC_API_KEY'})`)
})
