import { Types } from 'mongoose'
import { Response } from 'express'

// For in-memory (NOT persisted!)
export interface SSEClient {
  res: Response
  userId: Types.ObjectId
}

export interface Session {
  id: string
  tour: Types.ObjectId
  owner: Types.ObjectId
  clients: Types.ObjectId[]
  currentStep:
    | { type: 'item'; item: Types.ObjectId }
    | { type: 'quiz' }
    | { type: 'gathering' }
  quizStartedAt?: Date
  createdAt: Date
  state: 'waiting' | 'started' | 'quiz'
  // Do not serialize/store: this is runtime only!
  sseClients?: SSEClient[]
}
