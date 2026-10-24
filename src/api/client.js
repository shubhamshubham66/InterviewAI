const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'interviewai_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`)
  }
  return body
}

function postJSON(path, data) {
  return request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
}

function patchJSON(path, data) {
  return request(path, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
}

// ---- Auth ----

export function signup({ name, email, password, role }) {
  return postJSON('/auth/signup', { name, email, password, role })
}

export function login({ email, password }) {
  return postJSON('/auth/login', { email, password })
}

export function fetchMe() {
  return request('/auth/me')
}

export function deleteAccount() {
  return request('/auth/me', { method: 'DELETE' })
}

// ---- Interview ----

export function getMeta() {
  return request('/interview/meta')
}

export function startInterview({ role, interviewType, difficulty, resumeContext }) {
  return postJSON('/interview/start', { role, interviewType, difficulty, resumeContext })
}

export function submitAnswer({ sessionId, answer, durationSeconds }) {
  return postJSON('/interview/answer', { sessionId, answer, durationSeconds })
}

export function improveAnswer({ role, question, answer }) {
  return postJSON('/interview/improve', { role, question, answer })
}

export async function parseResume(file) {
  const formData = new FormData()
  formData.append('resume', file)
  return request('/resume/parse', { method: 'POST', body: formData })
}

// ---- Coding ----

export function listCodingProblems() {
  return request('/coding/problems')
}

export function getCodingProblem(id) {
  return request(`/coding/problems/${id}`)
}

export function runCode({ problemId, code, role }) {
  return postJSON(`/coding/problems/${problemId}/run`, { code, role })
}

// ---- Question bank ----

export function getQuestionBankCategories() {
  return request('/question-bank/categories')
}

export function listQuestionBank({ category, difficulty } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (difficulty) params.set('difficulty', difficulty)
  const qs = params.toString()
  return request(`/question-bank${qs ? `?${qs}` : ''}`)
}

export function getQuestionBankItem(id) {
  return request(`/question-bank/${id}`)
}

// ---- Admin / placement dashboard ----

export function getAdminOverview() {
  return request('/admin/overview')
}

// ---- Peer mock interviews ----

export function createPeerRoom({ role, displayName }) {
  return postJSON('/peer/rooms', { role, displayName })
}

export function joinPeerRoom(code, { displayName }) {
  return postJSON(`/peer/rooms/${code}/join`, { displayName })
}

export function getPeerRoom(code) {
  return request(`/peer/rooms/${code}`)
}

export function askPeerTurn(code, { question, askedByParticipantId, answeredByParticipantId }) {
  return postJSON(`/peer/rooms/${code}/turns`, { question, askedByParticipantId, answeredByParticipantId })
}

export function answerPeerTurn(code, turnId, { answer }) {
  return patchJSON(`/peer/rooms/${code}/turns/${turnId}`, { answer })
}

export function feedbackPeerTurn(code, turnId, { feedback, score }) {
  return patchJSON(`/peer/rooms/${code}/turns/${turnId}`, { feedback, score })
}

export function getPeerLeaderboard() {
  return request('/peer/leaderboard')
}

export function peerSocketUrl(code) {
  const apiUrl = new URL(BASE, window.location.href)
  const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${wsProtocol}//${apiUrl.host}/ws/peer?code=${encodeURIComponent(code)}`
}
