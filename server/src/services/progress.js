import { db } from '../db/index.js'

const DAY_MS = 86400000

function toDate(sqliteTimestamp) {
  return new Date(sqliteTimestamp + 'Z') // SQLite datetime('now') is already UTC
}

export function getProgress(userId) {
  const results = db
    .prepare(`SELECT average_score AS score, created_at AS createdAt FROM interview_results WHERE user_id = ? ORDER BY created_at ASC`)
    .all(userId)

  const now = new Date()
  const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const weekAgo = new Date(startOfTodayUTC.getTime() - 7 * DAY_MS)
  const twoWeeksAgo = new Date(startOfTodayUTC.getTime() - 14 * DAY_MS)

  const thisWeek = results.filter((r) => toDate(r.createdAt) >= weekAgo)
  const lastWeek = results.filter((r) => toDate(r.createdAt) >= twoWeeksAgo && toDate(r.createdAt) < weekAgo)

  const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, r) => a + r.score, 0) / arr.length) * 10) / 10 : null)
  const thisWeekAvg = avg(thisWeek)
  const lastWeekAvg = avg(lastWeek)
  const trend = thisWeekAvg == null || lastWeekAvg == null ? null : Math.round((thisWeekAvg - lastWeekAvg) * 10) / 10

  // Streak: consecutive UTC days with at least one session, counting back from
  // today. If today has no session yet, start from yesterday — today isn't
  // over, so it hasn't broken the streak yet.
  const daysWithSession = new Set(results.map((r) => toDate(r.createdAt).toISOString().slice(0, 10)))
  let cursor = startOfTodayUTC
  if (!daysWithSession.has(cursor.toISOString().slice(0, 10))) {
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  let streak = 0
  while (daysWithSession.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor = new Date(cursor.getTime() - DAY_MS)
  }

  return {
    totalSessions: results.length,
    thisWeekSessions: thisWeek.length,
    lastWeekSessions: lastWeek.length,
    thisWeekAverage: thisWeekAvg,
    trend,
    streakDays: streak,
    recent: results.slice(-10).reverse(),
  }
}
