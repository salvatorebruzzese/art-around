import express, { Request, Response } from 'express'

const router = express.Router()
const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes

type Session = {
  id: string
  clients: Response[]
  lastActive: number // timestamp in ms
}

let sessions: Session[] = []

router.post('/sessions/', (req: Request, res: Response) => {
  const { id } = req.body
  if (!id) {
    res.status(400).json({ error: 'Session id required' })
    return
  }
  if (sessions.find((session) => session.id === id)) {
    res.status(400).json({ error: 'Session with this id already exists' })
    return
  }
  sessions.push({ id, clients: [], lastActive: Date.now() })
  res.status(201).json({ message: 'Session created', id })
})

router.post('/sessions/:id', (req, res) => {
  const { message } = req.body
  const { id } = req.params
  const session = sessions.find((s) => s.id === id)
  if (!id || !session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  session.lastActive = Date.now() // Update lastActive on POST
  // Broadcast to all SSE clients
  session.clients.forEach((client) =>
    client.write(JSON.stringify({ data: message })),
  )
  res.json({ status: 'ok' })
})

router.get('/session/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const session = sessions.find((session) => session.id === id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  res.flushHeaders()

  session.clients.push(res)

  req.on('close', () => {
    session.clients = session.clients.filter((client) => client !== res)
    res.end()
  })
})

setInterval(() => {
  // Session timer
  const now = Date.now()
  sessions = sessions.filter((session) => {
    const alive = now - session.lastActive < SESSION_TIMEOUT
    if (!alive) {
      // End all SSE connections to this session
      session.clients.forEach((res) => res.end())
    }
    return alive
  })
}, 60 * 1000) // Check every minute

export default router
