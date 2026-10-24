import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

// Cost control for routes that call the AI (or run sandboxed code). Keyed by
// user id when signed in, falling back to IP for anonymous practice — a
// legitimate interview session makes roughly one call per question, so these
// limits comfortably cover real usage while blocking abuse/runaway loops.
// ipKeyGenerator normalizes IPv6 addresses so a client can't bypass the limit
// by varying the host part of its address.
export const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip)),
  message: { error: 'Too many AI requests. Wait a few minutes and try again.' },
})

// Code submissions get a higher ceiling than plain AI calls — a legitimate
// debugging session can mean many quick re-runs — but still bounded.
export const codeRunRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip)),
  message: { error: 'Too many code runs. Wait a few minutes and try again.' },
})
