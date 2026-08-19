import { Request, Response, NextFunction } from 'express'
import { dbError, DBError, notFound, NotFound } from './shared/errors.js'
import { Either, Left, Right } from 'purify-ts'
import { Model, Types, Document } from 'mongoose'

// A user and an editor are not that different, as editors are
// users who either created a tour or bought one and have the right to fork it
export enum Role {
  Guest = 'Guest',
  User = 'User',
  Teacher = 'Teacher',
  Admin = 'Admin',
}

const _resources = [
  'item',
  'asset',
  'museum',
  'tour',
  'user',
  'metatour',
] as const
const _actions = ['view', 'purchase', 'create', 'edit', 'delete'] as const

type Resource = (typeof _resources)[number]
type Action = (typeof _actions)[number]

// The cross-product type
type _Permission = `${Action}:${Resource}`

// REVIEW: are view:user and view:users different?
// Permission is a pair action:class
export type Permission =
  | _Permission
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
  'view:user',
  'delete:item',
  'purchase:tour',
  'create:tour',
  'create:item',
  'edit:tour',
  'edit:item',
  'edit:asset',
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
  [Role['Guest']]: Guest,
  [Role['User']]: User,
  [Role['Teacher']]: Teacher,
  [Role['Admin']]: Admin,
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
      return Left(notFound())
    }
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}
