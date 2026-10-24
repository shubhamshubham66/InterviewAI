import { db } from '../db/index.js'

function safeParseJSON(str, fallback) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export function getProfile(userId) {
  const user = db
    .prepare(
      'SELECT id, name, email, role, skills, target_role AS targetRole, preferred_language AS preferredLanguage, interview_preferences AS interviewPreferences, created_at AS createdAt FROM users WHERE id = ?'
    )
    .get(userId)
  if (!user) return null
  return { ...user, interviewPreferences: safeParseJSON(user.interviewPreferences, {}) }
}

export function updateProfile(userId, { name, skills, targetRole, preferredLanguage, interviewPreferences }) {
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!current) return null

  db.prepare(
    `UPDATE users SET name = ?, skills = ?, target_role = ?, preferred_language = ?, interview_preferences = ? WHERE id = ?`
  ).run(
    name?.trim() || current.name,
    skills !== undefined ? String(skills).slice(0, 500) : current.skills,
    targetRole !== undefined ? String(targetRole).slice(0, 120) : current.target_role,
    preferredLanguage !== undefined ? String(preferredLanguage).slice(0, 60) : current.preferred_language,
    interviewPreferences !== undefined ? JSON.stringify(interviewPreferences).slice(0, 2000) : current.interview_preferences,
    userId
  )
  return getProfile(userId)
}
