import { Types } from 'mongoose'
import { Response } from 'express'

export interface QuizQuestion {
  prompt: string
  options: string[]
  correct: number
  timeLimit: number
}

export interface Quiz {
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  answers: number[]
  submittedAt: Date
}

// For in-memory (NOT persisted!)
export interface SSEClient {
  res: Response
  userId: Types.ObjectId
}

export interface Session {
  _id: Types.ObjectId
  tour: Types.ObjectId
  owner: Types.ObjectId
  clients: Types.ObjectId[]
  currentStep: { type: 'item'; item: Types.ObjectId } | { type: 'quiz' }
  quizStartedAt?: Date
  quizAnswers?: Record<string, QuizAnswer>
  quizResults?: Record<string, { score: number }>
  createdAt: Date
  state: 'waiting' | 'started' | 'quiz'
  quiz: Quiz
  // Do not serialize/store: this is runtime only!
  sseClients?: SSEClient[]
}
