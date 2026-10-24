import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getProfile, updateProfile } from '../services/profile.js'
import { getProgress } from '../services/progress.js'

const router = Router()
router.use(requireAuth)

router.get('/', (req, res) => {
  res.json({ profile: getProfile(req.user.id) })
})

router.patch('/', (req, res) => {
  const { name, skills, targetRole, preferredLanguage, interviewPreferences } = req.body || {}
  const profile = updateProfile(req.user.id, { name, skills, targetRole, preferredLanguage, interviewPreferences })
  res.json({ profile })
})

router.get('/progress', (req, res) => {
  res.json(getProgress(req.user.id))
})

export default router
