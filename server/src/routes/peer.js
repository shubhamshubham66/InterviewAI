import { Router } from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { optionalAuth } from '../middleware/auth.js'
import { broadcastToRoom } from '../ws/peerServer.js'

const router = Router()
router.use(optionalAuth)

function genCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function roomByCode(code) {
  return db.prepare('SELECT * FROM peer_rooms WHERE code = ?').get((code || '').toUpperCase())
}

function roomSnapshot(code) {
  const room = roomByCode(code)
  if (!room) return null
  const participants = db
    .prepare('SELECT id, display_name AS displayName, user_id AS userId FROM peer_participants WHERE room_id = ? ORDER BY joined_at ASC')
    .all(room.id)
  const turns = db
    .prepare(
      `SELECT t.id, t.question, t.answer, t.feedback, t.score, t.created_at AS createdAt,
              asker.display_name AS askedBy, answerer.display_name AS answeredBy,
              t.asked_by_participant_id AS askedByParticipantId, t.answered_by_participant_id AS answeredByParticipantId
       FROM peer_turns t
       JOIN peer_participants asker ON asker.id = t.asked_by_participant_id
       JOIN peer_participants answerer ON answerer.id = t.answered_by_participant_id
       WHERE t.room_id = ?
       ORDER BY t.created_at ASC`
    )
    .all(room.id)
  return { code: room.code, role: room.role, createdAt: room.created_at, participants, turns }
}

router.post('/rooms', (req, res) => {
  const { role, displayName } = req.body || {}
  if (!role || !role.trim()) return res.status(400).json({ error: 'role is required.' })

  let code
  do {
    code = genCode()
  } while (roomByCode(code))

  const roomInfo = db.prepare('INSERT INTO peer_rooms (code, created_by, role) VALUES (?, ?, ?)').run(code, req.user?.id || null, role.trim())
  const name = (displayName || req.user?.name || 'Guest').trim().slice(0, 40) || 'Guest'
  const participant = db
    .prepare('INSERT INTO peer_participants (room_id, user_id, display_name) VALUES (?, ?, ?)')
    .run(roomInfo.lastInsertRowid, req.user?.id || null, name)

  res.status(201).json({ code, participantId: participant.lastInsertRowid, room: roomSnapshot(code) })
})

router.post('/rooms/:code/join', (req, res) => {
  const room = roomByCode(req.params.code)
  if (!room) return res.status(404).json({ error: 'Room not found. Check the code.' })

  const name = (req.body?.displayName || req.user?.name || 'Guest').trim().slice(0, 40) || 'Guest'
  const participant = db
    .prepare('INSERT INTO peer_participants (room_id, user_id, display_name) VALUES (?, ?, ?)')
    .run(room.id, req.user?.id || null, name)

  broadcastToRoom(room.code, { type: 'update' })
  res.status(201).json({ participantId: participant.lastInsertRowid, room: roomSnapshot(room.code) })
})

router.get('/rooms/:code', (req, res) => {
  const snapshot = roomSnapshot(req.params.code)
  if (!snapshot) return res.status(404).json({ error: 'Room not found.' })
  res.json(snapshot)
})

router.post('/rooms/:code/turns', (req, res) => {
  const room = roomByCode(req.params.code)
  if (!room) return res.status(404).json({ error: 'Room not found.' })

  const { question, askedByParticipantId, answeredByParticipantId } = req.body || {}
  if (!question || !question.trim() || !askedByParticipantId || !answeredByParticipantId) {
    return res.status(400).json({ error: 'question, askedByParticipantId and answeredByParticipantId are required.' })
  }
  const participants = db.prepare('SELECT id FROM peer_participants WHERE room_id = ?').all(room.id).map((p) => p.id)
  if (!participants.includes(askedByParticipantId) || !participants.includes(answeredByParticipantId)) {
    return res.status(400).json({ error: 'Both participants must belong to this room.' })
  }

  const info = db
    .prepare('INSERT INTO peer_turns (room_id, asked_by_participant_id, answered_by_participant_id, question) VALUES (?, ?, ?, ?)')
    .run(room.id, askedByParticipantId, answeredByParticipantId, question.trim())

  broadcastToRoom(room.code, { type: 'update' })
  res.status(201).json({ turnId: info.lastInsertRowid, room: roomSnapshot(room.code) })
})

router.patch('/rooms/:code/turns/:turnId', (req, res) => {
  const room = roomByCode(req.params.code)
  if (!room) return res.status(404).json({ error: 'Room not found.' })

  const turn = db.prepare('SELECT * FROM peer_turns WHERE id = ? AND room_id = ?').get(req.params.turnId, room.id)
  if (!turn) return res.status(404).json({ error: 'Turn not found.' })

  const { answer, feedback, score } = req.body || {}
  if (answer !== undefined) {
    db.prepare('UPDATE peer_turns SET answer = ? WHERE id = ?').run(answer, turn.id)
  }
  if (feedback !== undefined || score !== undefined) {
    const clampedScore = score != null ? Math.max(0, Math.min(10, Number(score))) : null
    db.prepare('UPDATE peer_turns SET feedback = COALESCE(?, feedback), score = COALESCE(?, score) WHERE id = ?').run(
      feedback ?? null,
      clampedScore,
      turn.id
    )
  }

  broadcastToRoom(room.code, { type: 'update' })
  res.json({ room: roomSnapshot(room.code) })
})

router.get('/leaderboard', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id AS userId, u.name, COUNT(t.id) AS answeredCount, AVG(t.score) AS averageScore
       FROM peer_turns t
       JOIN peer_participants p ON p.id = t.answered_by_participant_id
       JOIN users u ON u.id = p.user_id
       WHERE t.score IS NOT NULL
       GROUP BY u.id
       ORDER BY averageScore DESC
       LIMIT 20`
    )
    .all()
  res.json({ leaderboard: rows.map((r) => ({ ...r, averageScore: Math.round(r.averageScore * 10) / 10 })) })
})

export default router
