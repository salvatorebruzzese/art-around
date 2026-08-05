import { Request, Response, NextFunction } from 'express'

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
  | 'create:tour'
  | 'create:item'
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

// Assert statico per garantire l'esaustività su x, per typescript
export function assertNever(x: never): never {
  throw new Error('Unexpected case: ' + JSON.stringify(x))
}

export function checkRole(role: Role, permission: Permission): boolean {
  return ACMatrix[role] && ACMatrix[role].includes(permission)
}

export function filterRoles(role: Role, permission: Permission) {
  return ACMatrix[role] && ACMatrix[role].includes(permission)
}

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    return next()
  }
  res.status(401).json({ error: 'Unauthorized' })
}
