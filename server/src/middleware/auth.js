import { verifyToken, findUserById } from '../services/auth.js'

function extractUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const payload = verifyToken(token)
    const user = findUserById(payload.sub)
    return user || null
  } catch {
    return null
  }
}

export function optionalAuth(req, _res, next) {
  req.user = extractUser(req)
  next()
}

export function requireAuth(req, res, next) {
  req.user = extractUser(req)
  if (!req.user) return res.status(401).json({ error: 'Sign in required.' })
  next()
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Sign in required.' })
    if (req.user.role !== role) return res.status(403).json({ error: 'You do not have access to this.' })
    next()
  }
}
