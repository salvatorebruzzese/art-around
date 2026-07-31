import { ACMatrix, Permission, Role } from './models.js'

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
