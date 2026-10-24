import { Router } from 'express'
import { resumeUpload } from '../middleware/upload.js'
import { extractResumeText } from '../services/resumeParser.js'

const router = Router()

router.post('/parse', resumeUpload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Attach a resume file under the "resume" field.' })
  }
  try {
    const resumeContext = await extractResumeText(req.file)
    if (!resumeContext) {
      return res.status(422).json({ error: 'Could not extract any text from that file.' })
    }
    res.json({ resumeContext })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to parse resume.' })
  }
})

export default router
