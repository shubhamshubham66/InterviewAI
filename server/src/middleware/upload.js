import multer from 'multer'

const MAX_RESUME_BYTES = 5 * 1024 * 1024 // 5MB

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES },
})
