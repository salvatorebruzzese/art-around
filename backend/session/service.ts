import { Either, Left, Right } from 'purify-ts/Either'
import { Response } from 'express'
import crypto from 'crypto'
import { Types } from 'mongoose'
import { Session } from './model.js'
import { AccessDenied, DBError, NotFound, notFound } from '../shared/errors.js'
import UserService from '../user/service.js'
import { IUser } from '../user/model.js'

export interface SSEClient {
  userId: Types.ObjectId
  res: Response
}

// Sessioni di dominio (nessun socket salvato dentro Session)
const sessions: Map<string, Session> = new Map()

// Registry runtime separato: Map<sessionId, SSEClient[]>
const sseRegistry: Map<string, SSEClient[]> = new Map()

export function createSession(
  id: string,
  owner: Types.ObjectId,
  tour: Types.ObjectId,
): Either<NotFound, Session> {
  const session: Session = {
    id,
    tour,
    owner,
    clients: [],
    currentStep: { type: 'gathering' },
    createdAt: new Date(),
    state: 'waiting',
  }
  sessions.set(id, session)
  return Right(session)
}

export function joinSessionWithSSE(
  sessionId: string,
  client: SSEClient,
): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  if (!session) return Left(notFound())

  const pupil = client.userId

  // Aggiorna la sessione di dominio
  if (!session.clients.some((id) => id.equals(pupil))) {
    session.clients.push(pupil)
  }

  // Aggiorna il registry in-memory SSE
  const existingClients = sseRegistry.get(sessionId) ?? []
  if (!existingClients.some((c) => c.userId.equals(pupil))) {
    existingClients.push(client)
    sseRegistry.set(sessionId, existingClients)
  }

  return Right(session)
}

export async function joinSessionWithSSENoAcc(
  sessionId: string,
  res: Response,
  username: string,
): Promise<
  Either<DBError | AccessDenied | NotFound, [Partial<IUser>, string, Session]>
> {
  const session = sessions.get(sessionId)
  if (!session) return Left(notFound())

  const password = crypto.randomBytes(16).toString('hex')
  const result = await UserService.createUser({
    username,
    email: 'nomail@mail.com',
    password,
  })

  if (result.isLeft()) return result
  const user = result.unsafeCoerce()
  const userId = user._id as Types.ObjectId

  const sessionResult = joinSessionWithSSE(sessionId, { res, userId })
  return sessionResult.map((s) => [user, password, s])
}

export function removeSSEClient(
  sessionId: string,
  userId: Types.ObjectId,
): void {
  const clients = sseRegistry.get(sessionId)
  if (!clients) return

  // Confronto corretto tramite metodo .equals() di Mongoose/BSON
  const filtered = clients.filter((c) => !c.userId.equals(userId))

  if (filtered.length === 0) {
    sseRegistry.delete(sessionId)
  } else {
    sseRegistry.set(sessionId, filtered)
  }
}

export function getSSEStream(sessionId: string): Response[] {
  return (sseRegistry.get(sessionId) ?? []).map((c) => c.res)
}

export function showItem(
  sessionId: string,
  itemId: Types.ObjectId,
  _userId: Types.ObjectId,
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
  return Right(session)
}

export function submitQuiz(
  sessionId: string,
  _userId: Types.ObjectId,
  _answers: number[],
): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  if (!session || session.state !== 'quiz') return Left(notFound())
  return Right(session)
}

export function getSession(sessionId: string): Either<NotFound, Session> {
  const session = sessions.get(sessionId)
  return session ? Right(session) : Left(notFound())
}

export function getClients(
  sessionId: string,
): Either<NotFound, Types.ObjectId[]> {
  return getSession(sessionId).map((session) => session.clients)
}
