import { z } from 'zod'
import { Either, Left, Right } from 'purify-ts/Either'

// E.g. your service error type:
export type ValidationError = { type: 'ValidationError'; message: string }

// Generic validate function:
function validate<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
): Either<ValidationError, z.infer<T>> {
  const result = schema.safeParse(value)
  return result.success
    ? Right(result.data)
    : Left({ type: 'ValidationError', message: result.error.message })
}

export function makeZodValidator<T extends z.ZodTypeAny>(schema: T) {
  return (value: unknown) => validate(schema, value)
}
