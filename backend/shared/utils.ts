// Assert statico per garantire l'esaustività su x, per typescript
export function assertNever(x: never): never {
  throw new Error('Unexpected case: ' + JSON.stringify(x))
}

export type Projection<T> = Partial<Record<keyof T, boolean | 1 | 0>>

export function project<T>(projection: Projection<T>, obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in projection) {
    if (projection[key] && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key]
    }
  }
  return result
}
