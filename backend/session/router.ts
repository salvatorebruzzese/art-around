import express from 'express'
import z from 'zod'
import { Types } from 'mongoose'
import { ensureAuth } from '../accessControl.js'
import * as SessionService from './service.js'
import { handleLeft } from '../shared/router.js'
import UserService from '../user/service.js'
import { toPrivateUser } from '../user/model.js'

const router = express.Router()
type Event = 'showItem' | 'startQuiz' | 'quizAnswer'

// Emette l'evento recuperando gli stream attivi da SessionService
function sendSessionEvent(
  sessionId: string,
  event: Event,
  data: unknown,
): void {
  const streams = SessionService.getSSEStream(sessionId)
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  streams.forEach((res) => res.write(payload))
}

router.post('/', ensureAuth, async (req, res) => {
  const Validate = z.object({
    id: z.string().min(1),
    tour: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid ObjectId for tour',
    }),
  })

  const parse = Validate.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error })
  const { id, tour } = parse.data

  const result = SessionService.createSession(
    id,
    req.user!._id,
    new Types.ObjectId(tour),
  )

  result.caseOf({
    Right: (session) => {
      const serialized = {
        ...session,
        tour: session.tour.toHexString(),
        owner: session.owner.toHexString(),
        clients: session.clients.map((c) => c.toHexString()),
      }
      return res.status(201).json(serialized)
    },
    Left: handleLeft(res),
  })
})

router.post('/:id/joinAuth', async (req, res) => {
  const QuerySchema = z.object({
    username: z.string().min(1),
  })
  const queryParse = QuerySchema.safeParse(req.query)
  if (!queryParse.success) {
    return res.status(400).json({ error: queryParse.error })
  }

  const username = `tmp-${queryParse.data.username}`
  const sessionId = req.params.id

  const addResult = await SessionService.joinSessionWithSSENoAcc(
    sessionId,
    res,
    username,
  )

  if (addResult.isLeft()) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const [user, password] = addResult.unsafeCoerce()
  const userId = user._id as Types.ObjectId
  const privateUser = toPrivateUser(user as any)

  // Autentica l'utente temporaneo tramite Passport
  req.logIn(privateUser, (err) => {
    if (err) {
      console.error('Failed to log in temporary user:', err)
      return res.status(500).json({ error: 'Authentication failed' })
    }

    // Ritorna le credenziali e l'utente è ora autenticato nel cookie di sessione
    res.json({
      username: privateUser.username,
      password,
      user: privateUser,
    })
  })
})

router.get('/:id/join', async (req, res) => {
  const QuerySchema = z.object({
    username: z.string().min(1),
  })
  const queryParse = QuerySchema.safeParse(req.query)
  if (!queryParse.success) {
    return res.status(400).json({ error: queryParse.error })
  }

  const username = `tmp-${queryParse.data.username}`
  const sessionId = req.params.id

  const session = SessionService.getSession(sessionId)
  if (session.isLeft()) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const userId = req.user?._id as Types.ObjectId
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  // Aggiungi il client al session registry SSE
  const sseClient = { userId, res }
  SessionService.joinSessionWithSSE(sessionId, sseClient)

  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
  })
  res.flushHeaders()
  res.write('\n')

  const joinPayload = `event: hasJoined\ndata: ${JSON.stringify({ username })}\n\n`
  res.write(joinPayload)

  req.on('close', () => {
    SessionService.removeSSEClient(sessionId, userId)
  })
})

router.post('/:id/showItem', ensureAuth, async (req, res) => {
  const Validate = z.object({
    itemId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid ObjectId for itemId',
    }),
  })

  const parse = Validate.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error })
  const { itemId } = parse.data
  const sessionId = req.params.id as string

  const result = SessionService.showItem(
    sessionId,
    new Types.ObjectId(itemId),
    req.user!._id,
  )

  result.caseOf({
    Right: (session) => {
      sendSessionEvent(sessionId, 'showItem', { itemId })
      const serialized = {
        ...session,
        tour: session.tour.toHexString(),
        owner: session.owner.toHexString(),
        clients: session.clients.map((c) => c.toHexString()),
      }
      return res.json(serialized)
    },
    Left: handleLeft(res),
  })
})

router.post('/:id/startQuiz', ensureAuth, async (req, res) => {
  const sessionId = req.params.id
  const result = SessionService.startQuiz(sessionId as string)

  result.caseOf({
    Right: (session) => {
      sendSessionEvent(sessionId as string, 'startQuiz', {})
      const serialized = {
        ...session,
        tour: session.tour.toHexString(),
        owner: session.owner.toHexString(),
        clients: session.clients.map((c) => c.toHexString()),
      }
      return res.json(serialized)
    },
    Left: handleLeft(res),
  })
})

router.post('/:id/submitQuiz', ensureAuth, async (req, res) => {
  const Validate = z.object({ answers: z.array(z.number()) })
  const parse = Validate.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error })
  const { answers } = parse.data
  const sessionId = req.params.id

  const result = SessionService.submitQuiz(
    sessionId as string,
    req.user!._id,
    answers,
  )

  result.caseOf({
    Right: () => {
      sendSessionEvent(sessionId as string, 'quizAnswer', {
        userId: req.user!._id,
      })
      return res.json({ status: 'ok' })
    },
    Left: handleLeft(res),
  })
})

router.get('/:id', async (req, res) => {
  const result = SessionService.getSession(req.params.id)

  result.caseOf({
    Right: (session) => {
      const serialized = {
        ...session,
        tour: session.tour.toHexString(),
        owner: session.owner.toHexString(),
        clients: session.clients.map((c) => c.toHexString()),
      }
      return res.json(serialized)
    },
    Left: handleLeft(res),
  })
})

router.get('/:id/clients', async (req, res) => {
  const result = SessionService.getClients(req.params.id)

  result.caseOf({
    Right: (clients: Types.ObjectId[]) => {
      const safeClients = Array.isArray(clients)
        ? clients.map((c: Types.ObjectId) => ({
            id: c.toHexString(),
            username: 'Anonimo',
          }))
        : []
      return res.json(safeClients)
    },
    Left: handleLeft(res),
  })
})

router.get('/:id/quizResults', async (req, res) => {
  const result = SessionService.getQuizResults(req.params.id)

  result.caseOf({
    Right: (results) => {
      return res.json(results)
    },
    Left: handleLeft(res),
  })
})

export default router
