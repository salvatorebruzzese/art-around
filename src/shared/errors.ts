export type BaseError = {
  details?: string
}

export type NotFound = { type: 'NotFound' } & BaseError
export type DBError = { type: 'DBError'; message: string } & BaseError
export type AccessDenied = { type: 'AccessDenied'; message: string } & BaseError

function mkdetails(detailsProvider?: () => string) {
  return process.env.DEBUG && detailsProvider ? detailsProvider() : undefined
}

export function notFound(detailsProvider?: () => string): NotFound {
  return { type: 'NotFound', details: mkdetails(detailsProvider) }
}
export function dbError(
  message: string,
  detailsProvider?: () => string,
): DBError {
  return { type: 'DBError', message, details: mkdetails(detailsProvider) }
}

export function accessDenied(
  message: string,
  detailsProvider?: () => string,
): AccessDenied {
  return { type: 'AccessDenied', message, details: mkdetails(detailsProvider) }
}
