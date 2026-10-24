const sessions = new Map()
const SESSION_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

export function createSession(data) {
  const id = data.id
  sessions.set(id, { ...data, createdAt: Date.now() })
  return sessions.get(id)
}

export function getSession(id) {
  const session = sessions.get(id)
  if (!session) return null
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(id)
    return null
  }
  return session
}

export function updateSession(id, updater) {
  const session = getSession(id)
  if (!session) return null
  updater(session)
  sessions.set(id, session)
  return session
}

export function deleteSession(id) {
  sessions.delete(id)
}
