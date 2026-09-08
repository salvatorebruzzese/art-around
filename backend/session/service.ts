import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import { Session, Quiz, SSEClient } from './model.js'
import { NotFound, notFound } from '../shared/errors.js'

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
