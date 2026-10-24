import { test } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/index.js'
import { getProgress } from '../src/services/progress.js'

function makeUser() {
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run('Test User', `user${Date.now()}${Math.random()}@test.com`, 'hash')
  return info.lastInsertRowid
}

function insertResult(userId, score, date) {
  const stamp = date.toISOString().slice(0, 19).replace('T', ' ')
  db.prepare('INSERT INTO interview_results (user_id, average_score, created_at) VALUES (?, ?, ?)').run(userId, score, stamp)
}

test('no sessions means zero streak and zero totals', () => {
  const userId = makeUser()
  const p = getProgress(userId)
  assert.equal(p.totalSessions, 0)
  assert.equal(p.streakDays, 0)
  assert.equal(p.thisWeekAverage, null)
})

test('streak counts consecutive days including today', () => {
  const userId = makeUser()
  const now = new Date()
  for (let i = 0; i < 3; i++) {
    insertResult(userId, 7, new Date(now.getTime() - i * 86400000))
  }
  const p = getProgress(userId)
  assert.equal(p.streakDays, 3)
})

test('streak breaks across a gap day', () => {
  const userId = makeUser()
  const now = new Date()
  insertResult(userId, 7, now)
  insertResult(userId, 7, new Date(now.getTime() - 2 * 86400000)) // gap at -1 day
  const p = getProgress(userId)
  assert.equal(p.streakDays, 1)
})

test('streak still counts yesterday if today has no session yet', () => {
  const userId = makeUser()
  const now = new Date()
  insertResult(userId, 7, new Date(now.getTime() - 86400000))
  insertResult(userId, 7, new Date(now.getTime() - 2 * 86400000))
  const p = getProgress(userId)
  assert.equal(p.streakDays, 2)
})

test('averages only include scored sessions within the window', () => {
  const userId = makeUser()
  const now = new Date()
  insertResult(userId, 8, now)
  insertResult(userId, 6, now)
  const p = getProgress(userId)
  assert.equal(p.thisWeekAverage, 7)
  assert.equal(p.thisWeekSessions, 2)
})
