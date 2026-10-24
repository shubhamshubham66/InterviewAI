import { WebSocketServer } from 'ws'

// Deliberately dumb: the WS layer carries zero business logic, just a per-room
// broadcast relay. All mutations go through the REST peer routes (so they're
// validated and persisted the normal way); this just tells other tabs in the
// same room "something changed, refetch".
const rooms = new Map() // code -> Set<WebSocket>

export function attachPeerWebSocket(httpServer) {
  const wss = new WebSocketServer({ noServer: true })

  httpServer.on('upgrade', (req, socket, head) => {
    let url
    try {
      url = new URL(req.url, 'http://localhost')
    } catch {
      socket.destroy()
      return
    }
    if (url.pathname !== '/ws/peer') {
      socket.destroy()
      return
    }
    const code = (url.searchParams.get('code') || '').toUpperCase()
    if (!code) {
      socket.destroy()
      return
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.roomCode = code
      if (!rooms.has(code)) rooms.set(code, new Set())
      rooms.get(code).add(ws)
      ws.on('close', () => {
        rooms.get(code)?.delete(ws)
        if (rooms.get(code)?.size === 0) rooms.delete(code)
      })
    })
  })

  return wss
}

export function broadcastToRoom(code, data) {
  const sockets = rooms.get(code)
  if (!sockets || !sockets.size) return
  const payload = JSON.stringify(data)
  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) ws.send(payload)
  }
}
