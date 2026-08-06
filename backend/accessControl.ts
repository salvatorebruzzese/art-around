import { Request, Response, NextFunction } from 'express'
import { DBError, NotFound } from './shared/errors.js'
import { Either, Left, Right } from 'purify-ts'
import { Model, Types, Document } from 'mongoose'

// A user and an editor are not that different, as editors are
// users who either created a tour or bought one and have the right to fork it
export type Role = 'Guest' | 'User' | 'Teacher' | 'Admin'

// Permission is a pair action:class
export type Permission =
  | 'view:item'
  | 'view:museum'
  | 'view:tour'
  | 'view:metatour'
  | 'purchase:tour'
  | 'create:item'
  | 'delete:item'
  | 'create:tour'
  | 'edit:tour'
  | 'delete:tour'
  | 'manage:group'
  | 'sync:navigator'
  | 'assign:quiz'
  | 'view:users'
  | 'edit:all'

const Guest: Permission[] = ['view:museum', 'view:metatour']

const User: Permission[] = [
  'view:museum',
  'view:metatour',
  'view:tour',
  'view:item',
  'delete:item',
  'purchase:tour',
  'create:tour',
  'create:item',
  'edit:tour',
  'delete:tour',
]

const Teacher: Permission[] = [
  ...User,
  'manage:group',
  'sync:navigator',
  'assign:quiz',
  'view:users',
]

const Admin: Permission[] = [...Teacher, 'edit:all']

export const ACMatrix: Record<Role, Permission[]> = {
  Guest,
  User,
  Teacher,
  Admin,
}

export function checkRole(role: Role, permission: Permission): boolean {
  return ACMatrix[role] && ACMatrix[role].includes(permission)
}

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    return next()
  }
  res.status(401).json({ error: 'Unauthorized' })
}

export async function _getById<T extends Document>(
  id: Types.ObjectId,
  model: Model<T>,
): Promise<Either<NotFound | DBError, T>> {
  try {
    const doc = await model.findById(id).exec()
    if (doc) {
      return Right(doc)
    } else {
      return Left({ type: 'NotFound' as const })
    }
  } catch (e) {
    return Left({
      type: 'DBError',
      message: 'An error occurred with the database.',
      details: process.env.DEBUG ? String(e) : undefined,
    })
  }
}
