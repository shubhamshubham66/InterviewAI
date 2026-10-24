import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'

const MAX_CHARS = 4000

export async function extractResumeText(file) {
  if (!file) return ''

  let text = ''
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer)
    text = data.text
  } else if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer })
    text = value
  } else {
    throw Object.assign(new Error('Unsupported file type. Upload a PDF or DOCX resume.'), { status: 415 })
  }

  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS)
}
