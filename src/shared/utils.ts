import { Request, Response, NextFunction } from 'express'
import { ACMatrix, Permission, Role } from './models.js'
import { Model, Document, Types } from 'mongoose'
import { DBError, NotFound } from './errors.js'
import { Either, Left, Right } from 'purify-ts'

// Assert statico per garantire l'esaustività su x, per typescript
export function assertNever(x: never): never {
  throw new Error('Unexpected case: ' + JSON.stringify(x))
}

export function checkRole(roles: Role[], permission: Permission): boolean {
  return roles.some(
    (role) => ACMatrix[role] && ACMatrix[role].includes(permission),
  )
}

export function filterRoles(roles: Role[], permission: Permission) {
  return roles.filter(
    (role) => ACMatrix[role] && ACMatrix[role].includes(permission),
  )
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
