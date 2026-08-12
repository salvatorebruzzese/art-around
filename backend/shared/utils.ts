// Assert statico per garantire l'esaustività su x, per typescript
export function assertNever(x: never): never {
  throw new Error('Unexpected case: ' + JSON.stringify(x))
}

// TODO: add explanation of project function

export type Projection<T> = Partial<Record<keyof T, boolean | 1 | 0>>

export function project<T>(projection: Projection<T>, obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in projection) {
    if (projection[key] && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key]
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(obj, '_id') &&
    !('_id' in projection)
  ) {
    // _id not specified, so include it
    result['_id' as keyof T] = obj['_id' as keyof T]
  }

  // If _id is explicitly 0/false, remove it
  if ('_id' in projection && !projection['_id']) {
    delete result['_id' as keyof T]
  }

  return result
}
