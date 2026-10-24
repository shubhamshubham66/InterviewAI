import { Router } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { createUser, findUserByEmail, verifyPassword, signToken, toPublicUser, findOrCreateByEmail, EMAIL_RE } from '../services/auth.js'
import { generateOtp, verifyOtp } from '../services/otp.js'
import { sendOtpEmail } from '../services/email.js'
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

// Separate, tighter limit for sending the email itself (keyed by the target
// email, falling back to IP) — this is what actually costs money per send.
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body?.email ? `email:${String(req.body.email).trim().toLowerCase()}` : ipKeyGenerator(req.ip)),
  message: { error: 'Too many codes requested for this email. Wait a bit and try again.' },
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

// Email-code (OTP) login/signup: request a code, then verify it. Works for
// both a brand new email (creates a passwordless account) and an existing one.
router.post('/otp/request', otpRequestLimiter, async (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' })

  const code = generateOtp(email)
  try {
    await sendOtpEmail(email, code)
  } catch (err) {
    return res.status(502).json({ error: 'Could not send the email right now. Try again shortly.' })
  }
  res.json({ sent: true })
})

router.post('/otp/verify', authLimiter, async (req, res) => {
  const { code, name } = req.body || {}
  const email = (req.body?.email || '').trim().toLowerCase()
  if (!email || !code) return res.status(400).json({ error: 'email and code are required.' })

  const result = verifyOtp(email, String(code).trim())
  if (!result.ok) return res.status(400).json({ error: result.reason })

  try {
    const user = findOrCreateByEmail({ name, email })
    const token = signToken(user)
    res.json({ token, user: toPublicUser(user) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Could not sign in.' })
  }
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
