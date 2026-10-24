import { Router } from 'express'
import { db } from '../db/index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireRole('placement_admin'))

router.get('/overview', (_req, res) => {
  const totals = db
    .prepare(
      `SELECT COUNT(DISTINCT user_id) AS activeStudents, COUNT(*) AS totalSessions, AVG(average_score) AS overallAverage
       FROM interview_results`
    )
    .get()

  const totalStudents = db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role = 'student'`).get().n

  const skillGap = db
    .prepare(
      `SELECT COALESCE(role, interview_type) AS label, kind, COUNT(*) AS sessions, AVG(average_score) AS averageScore
       FROM interview_results
       GROUP BY label, kind
       ORDER BY averageScore ASC`
    )
    .all()

  const activity = db
    .prepare(
      `SELECT date(created_at) AS day, COUNT(*) AS sessions
       FROM interview_results
       WHERE created_at >= datetime('now', '-14 days')
       GROUP BY day
       ORDER BY day ASC`
    )
    .all()

  const perStudent = db
    .prepare(
      `SELECT u.id, u.name, u.email, COUNT(r.id) AS sessions, AVG(r.average_score) AS averageScore, MAX(r.created_at) AS lastActive
       FROM users u
       LEFT JOIN interview_results r ON r.user_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY sessions DESC`
    )
    .all()

  res.json({
    totalStudents,
    activeStudents: totals.activeStudents || 0,
    totalSessions: totals.totalSessions || 0,
    overallAverage: totals.overallAverage != null ? Math.round(totals.overallAverage * 10) / 10 : null,
    skillGap: skillGap.map((r) => ({ ...r, averageScore: Math.round(r.averageScore * 10) / 10 })),
    activity,
    students: perStudent.map((s) => ({
      ...s,
      averageScore: s.averageScore != null ? Math.round(s.averageScore * 10) / 10 : null,
    })),
  })
})

export default router
