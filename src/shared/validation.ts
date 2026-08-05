import { z } from 'zod'
import { Either, Left, Right } from 'purify-ts/Either'
import { ValidationError, validationError } from './errors.js'

function validate<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
): Either<ValidationError, z.infer<T>> {
  const result = schema.safeParse(value)
  return result.success
    ? Right(result.data)
    : Left(
        validationError(
          result.error.issues[0].path.map(String),
          result.error.message,
          () => JSON.stringify(result.error),
        ),
      )
}

export function makeZodValidator<T extends z.ZodTypeAny>(schema: T) {
  return (value: unknown) => validate(schema, value)
}

export const objectIdZod = z.string().refine((val) => isValidObjectId(val), {
  error: 'Must be a valid ObjectId type',
})
