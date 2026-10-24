import { db } from '../db/index.js'

export function recordResult({ userId, kind, role, interviewType, difficulty, averageScore }) {
  if (!userId) return
  db.prepare(
    'INSERT INTO interview_results (user_id, kind, role, interview_type, difficulty, average_score) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, kind, role || null, interviewType || null, difficulty || null, averageScore)
}

export function listResultsForUser(userId) {
  return db.prepare('SELECT * FROM interview_results WHERE user_id = ? ORDER BY created_at DESC').all(userId)
}
