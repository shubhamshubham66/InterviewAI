const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`)
  }
  return body
}

export function getMeta() {
  return request('/interview/meta')
}

export function startInterview({ role, interviewType, difficulty, resumeContext }) {
  return request('/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, interviewType, difficulty, resumeContext }),
  })
}

export function submitAnswer({ sessionId, answer }) {
  return request('/interview/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, answer }),
  })
}

export async function parseResume(file) {
  const formData = new FormData()
  formData.append('resume', file)
  return request('/resume/parse', { method: 'POST', body: formData })
}
