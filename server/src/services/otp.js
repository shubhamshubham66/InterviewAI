import crypto from 'crypto'

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

// In-memory by design: codes are short-lived (10 min), so there's no need to
// survive a restart — a restart just means anyone mid-login requests a new code.
const store = new Map() // email -> { code, expiresAt, attempts }

export function generateOtp(email) {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
  store.set(email, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 })
  return code
}

export function verifyOtp(email, code) {
  const entry = store.get(email)
  if (!entry) return { ok: false, reason: 'Request a new code for this email.' }

  if (Date.now() > entry.expiresAt) {
    store.delete(email)
    return { ok: false, reason: 'That code expired. Request a new one.' }
  }

  entry.attempts += 1
  if (entry.attempts > MAX_ATTEMPTS) {
    store.delete(email)
    return { ok: false, reason: 'Too many incorrect attempts. Request a new code.' }
  }

  if (entry.code !== code) {
    return { ok: false, reason: 'Incorrect code.' }
  }

  store.delete(email)
  return { ok: true }
}
