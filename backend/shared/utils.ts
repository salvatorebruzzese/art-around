// Assert statico per garantire l'esaustività su x, per typescript
export function assertNever(x: never): never {
  throw new Error('Unexpected case: ' + JSON.stringify(x))
}

export type ShallowAny<T> = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  [K in keyof T]: any
}
