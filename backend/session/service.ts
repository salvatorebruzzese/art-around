import { Either, Left, Right } from 'purify-ts/Either'
import { Response } from 'express'
import crypto from 'crypto'
import { Types } from 'mongoose'
import { Session, Quiz, SSEClient } from './model.js'
import { AccessDenied, DBError, NotFound, notFound } from '../shared/errors.js'
import UserService from '../user/service.js'
import { IUser } from '../user/model.js'

const sessions: Map<string, Session> = new Map()

export function createSession(
  id: string,
  owner: Types.ObjectId,
  tour: Types.ObjectId,
  quiz: Quiz,
): Either<NotFound, Session> {
  const session: Session = {
    id: id,
    tour,
    owner,
    clients: [],
    currentStep: { type: 'gathering' },
    createdAt: new Date(),
    state: 'waiting',
    quiz,
    sseClients: [],
  }
  sessions.set(id, session)
  return Right(session)
}
export async function joinSessionWithSSENoAcc(
  sessionId: string,
  res: Response,
  username: string,
): Promise<
  Either<DBError | AccessDenied | NotFound, [Partial<IUser>, string, Session]>
> {
  const password = crypto.randomBytes(16).toString('hex')
  const result = await UserService.createUser({
    username: username,
    email: 'nomail@mail.com',
    password: password, // 16 bytes = 32 hex chars
  })

  if (result.isLeft()) return result
  const user = result.unsafeCoerce()
  const userId = user._id

  const session = sessions.get(sessionId)
  if (!session) return Left(notFound())
  user.purchasedTours = [session.tour]
  await (user as IUser).save()

  const sessionResult = joinSessionWithSSE(sessionId, { res, userId })
  return sessionResult.map((session) => [user, password, session])
}

export function joinSessionWithSSE(
  sessionId: string,
  client: SSEClient,
): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  const pupil = client.userId
  if (!session) return Left(notFound())
  if (!session.clients.some((id) => id.equals(pupil)))
    session.clients.push(pupil)
  session.sseClients = session.sseClients || []
  if (!session.sseClients.some((c) => c.userId.equals(pupil)))
    session.sseClients.push(client)
  return Right(session)
}

export function removeSSEClient(
  sessionId: string,
  userId: Types.ObjectId,
): void {
  const session = sessions.get(sessionId)
  if (!session || !session.sseClients) return
  session.sseClients = session.sseClients.filter((c) => c.userId !== userId)
}

export function showItem(
  sessionId: string,
  itemId: Types.ObjectId,
  userId: Types.ObjectId,
): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  if (!session) return Left(notFound())
  session.currentStep = { type: 'item', item: itemId }
  session.state = 'started'
  return Right(session)
}

export function startQuiz(sessionId: string): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  if (!session) return Left(notFound())
  session.currentStep = { type: 'quiz' }
  session.quizStartedAt = new Date()
  session.state = 'quiz'
  session.quizAnswers = {}
  return Right(session)
}

export function submitQuiz(
  sessionId: string,
  userId: Types.ObjectId,
  answers: number[],
): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  if (!session || session.state !== 'quiz') return Left(notFound())
  if (!session.quizAnswers) session.quizAnswers = {}
  session.quizAnswers[userId.toHexString()] = {
    answers,
    submittedAt: new Date(),
  }
  return Right(session)
}

export function getSession(sessionId: string): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  return session ? Right(session) : Left(notFound())
}
