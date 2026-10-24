import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { createUser, findUserByEmail, verifyPassword, signToken, toPublicUser } from '../services/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { db } from '../db/index.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
})

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const user = await createUser(req.body || {})
    const token = signToken(user)
    res.status(201).json({ token, user: toPublicUser(user) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Could not create account.' })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {}
  const user = email ? findUserByEmail(email) : null
  const valid = user ? await verifyPassword(user, password) : false
  if (!user || !valid) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }
  const token = signToken(user)
  res.json({ token, user: toPublicUser(user) })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) })
})

// Deletes the account and every interview/coding result and peer-room row tied to
// it (foreign keys are ON DELETE CASCADE / SET NULL) — supports "delete my data".
router.delete('/me', requireAuth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id)
  res.status(204).end()
})

export default router
