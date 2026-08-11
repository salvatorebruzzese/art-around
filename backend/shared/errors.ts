export type BaseError = {
  details?: string
}

export type NotFound = { type: 'NotFound' } & BaseError
export type DBError = { type: 'DBError'; message: string } & BaseError
export type AccessDenied = { type: 'AccessDenied'; message: string } & BaseError
export type ValidationError = {
  type: 'ValidationError'
  field: string | string[]
  message: string
} & BaseError
export type ConflictError = {
  type: 'ConflictError'
  message: string
  field: string | string[]
} & BaseError

function mkdetails(detailsProvider?: () => string) {
  return process.env.DEBUG && detailsProvider ? detailsProvider() : undefined
}

export function notFound(detailsProvider?: () => string): NotFound {
  return { type: 'NotFound', details: mkdetails(detailsProvider) }
}
export function dbError(
  message?: string,
  detailsProvider?: () => string,
): DBError {
  return {
    type: 'DBError',
    message: message || 'A DB error occured.',
    details: mkdetails(detailsProvider),
  }
}

export function accessDenied(
  message?: string,
  detailsProvider?: () => string,
): AccessDenied {
  return {
    type: 'AccessDenied',
    message: message || 'Access denied.',
    details: mkdetails(detailsProvider),
  }
}

export function validationError(
  field: string | string[],
  message?: string,
  detailsProvider?: () => string,
): ValidationError {
  return {
    type: 'ValidationError',
    field: field,
    message: message || 'Invalid input provided.',
    details: mkdetails(detailsProvider),
  }
}

export function conflictError(
  field: string | string[],
  message?: string,
  detailsProvider?: () => string,
): ConflictError {
  return {
    type: 'ConflictError',
    field: field,
    message: message || 'A field is conflicting.',
    details: mkdetails(detailsProvider),
  }
}
