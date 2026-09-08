import express from 'express'
import z from 'zod'
import { Types } from 'mongoose'
import { ensureAuth } from '../accessControl.js'
import * as SessionService from './service.js'
import { handleLeft } from '../shared/router.js'
import { Session } from './model.js'
import UserService from '../user/service.js'

const router = express.Router()
type Event = 'showItem' | 'startQuiz' | 'quizAnswer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sendSessionEvent(session: Session, event: Event, data: any) {
  if (!session.sseClients) return
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  session.sseClients.forEach(({ res }) => res.write(payload))
}

router.post('/', ensureAuth, async (req, res) => {
  const Validate = z.object({
    id: z.string(),
    tour: z.string(),
    quiz: z.object({
      questions: z.array(
        z.object({
          prompt: z.string(),
          options: z.array(z.string()),
          correct: z.number(),
          timeLimit: z.number(),
        }),
      ),
    }),
  })
  const parse = Validate.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error })
  const { id, tour, quiz } = parse.data
  const result = SessionService.createSession(
    id,
    req.user!._id,
    new Types.ObjectId(tour),
    quiz,
  )

  result.caseOf({
    Right: (session) => res.status(201).json(session),
    Left: handleLeft(res),
  })
})

router.get('/:id/join', async (req, res) => {
  const username = ('tmp-' + req.query.username) as string
  const sessionId = req.params.id as string
  const addResult = await SessionService.joinSessionWithSSENoAcc(
    sessionId,
    res,
    username,
  )

  if (addResult.isLeft()) return res.status(404)
  const [user, password, _session] = addResult.unsafeCoerce()
  const userId = user._id

  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
  })
  res.flushHeaders()
  res.write('\n')
  const joinPayload = `event: hasJoined\ndata: ${JSON.stringify({ username: user.username, password })}\n\n`
  res.write(joinPayload)

  req.on('close', () => {
    console.log('Closed connection: ', sessionId, userId)
    SessionService.removeSSEClient(sessionId, userId)
    UserService.deleteUser(userId, userId)
  })
})

router.post('/:id/showItem', ensureAuth, async (req, res) => {
  const Validate = z.object({ itemId: z.string() })
  const parse = Validate.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error })
  const { itemId } = parse.data
  const result = SessionService.showItem(
    req.params.id as string,
    new Types.ObjectId(itemId),
    req.user!._id, // REVIEW: should new Types.ObjectId?
  )
  result.caseOf({
    Right: (session) => {
      sendSessionEvent(session, 'showItem', { itemId })
      return res.json(session)
    },
    Left: handleLeft(res),
  })
})

router.post('/:id/startQuiz', ensureAuth, async (req, res) => {
  const result = SessionService.startQuiz(req.params.id as string)
  result.caseOf({
    Right: (session) => {
      sendSessionEvent(session, 'startQuiz', {})
      return res.json(session)
    },
    Left: handleLeft(res),
  })
})

router.post('/:id/submitQuiz', ensureAuth, async (req, res) => {
  const Validate = z.object({ answers: z.array(z.number()) })
  const parse = Validate.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error })
  const { answers } = parse.data
  const result = SessionService.submitQuiz(
    req.params.id as string,
    req.user!._id,
    answers,
  )
  result.caseOf({
    Right: (session) => {
      sendSessionEvent(session, 'quizAnswer', { userId: req.user!._id })
      return res.json({ status: 'ok' })
    },
    Left: handleLeft(res),
  })
})

// For inspection/debug
router.get('/:id', async (req, res) => {
  const result = SessionService.getSession(req.params.id as string)

  result.caseOf({
    Right: (session) => res.json(session),
    Left: handleLeft(res),
  })
})

export default router
