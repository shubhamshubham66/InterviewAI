import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { db } from '../db/index.js'

// A real deployment MUST set JWT_SECRET. Falling back to a random secret keeps
// the app usable in mock/dev mode, but it means every restart invalidates
// existing tokens (everyone is logged out) — documented in the README.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set — using a random secret for this process. Set JWT_SECRET in production so sessions survive restarts.')
}

const TOKEN_TTL = '7d'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

export async function createUser({ name, email, password, role }) {
  name = (name || '').trim()
  email = (email || '').trim().toLowerCase()
  role = role === 'placement_admin' ? 'placement_admin' : 'student'

  if (name.length < 2) throw httpError(400, 'Name must be at least 2 characters.')
  if (!EMAIL_RE.test(email)) throw httpError(400, 'Enter a valid email address.')
  if (!password || password.length < 8) throw httpError(400, 'Password must be at least 8 characters.')
  if (findUserByEmail(email)) throw httpError(409, 'An account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 12)
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name, email, passwordHash, role)
  return findUserById(info.lastInsertRowid)
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password || '', user.password_hash)
}

function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}
