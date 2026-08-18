// Assert statico per garantire l'esaustività su x, per typescript
export function assertNever(x: never): never {
  throw new Error('Unexpected case: ' + JSON.stringify(x))
}

// TODO: add explanation of project function

export function project<T, K extends keyof T>(
  keys: K[],
  obj: T & object,
): Pick<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: any = {}
  keys.forEach((key) => {
    if (key in obj) ret[key] = obj[key]
  })
  if (!('_id' in keys) && '_id' in obj) {
    ret['_id'] = obj['_id']
  }
  return ret
}
