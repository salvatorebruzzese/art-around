import z from 'zod'
import { isValidObjectId } from 'mongoose'
import { Either, Left, Right } from 'purify-ts/Either'
import { ItemType } from './models.js'
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

const objectIdZod = z.string().refine((val) => isValidObjectId(val), {
  error: 'Must be a valid ObjectId type',
})
// --------------
// USER VALIDATOR
// --------------

const UserBaseSchemaZod = z.object({
  username: z.string(),
  profilePicture: objectIdZod.optional(), // Asset
})

const UserQuerySchemaZod = z.object({
  ...UserBaseSchemaZod,
  role: z.string(),
  authoredTours: z.array(objectIdZod).optional(), // Tour
})

const UserInputSchemaZod = z.object({
  ...UserBaseSchemaZod,
  password: z.string(),
})

export type UserQuery = z.infer<typeof UserQuerySchemaZod>
export const UserQuery = { validate: makeZodValidator(UserQuerySchemaZod) }

export type UserInput = z.infer<typeof UserInputSchemaZod>
export const UserInput = { validate: makeZodValidator(UserInputSchemaZod) }

// ----------------
// REVIEW VALIDATOR
// ----------------

// Works for both query and input
const ReviewSchemaZod = z.object({
  user: objectIdZod,
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export type Review = z.infer<typeof ReviewSchemaZod>
export const Review = { validate: makeZodValidator(ReviewSchemaZod) }

// --------------
// TOUR VALIDATOR
// --------------

// Works for both query and input
const TourSchemaZod = z.object({
  name: z.string(),
  author: z.string(),
  price: z.number(),
  items: z.array(objectIdZod), // Item
  thumbnail: objectIdZod.optional(), // Asset
  images: z.array(objectIdZod).optional(), // Asset
  description: z.string().optional(),
  reviews: z.array(ReviewSchemaZod).optional(),
})

export type Tour = z.infer<typeof TourSchemaZod>
export const Tour = { validate: makeZodValidator(TourSchemaZod) }

// ------------------
// POSITION VALIDATOR
// ------------------

const PositionSchemaZod = z.object({
  coordinates: z.array(z.number()).length(2),
})

export type Position = z.infer<typeof PositionSchemaZod>
export const Position = { validate: makeZodValidator(PositionSchemaZod) }

// ---------------------
// DESCRIPTION VALIDATOR
// ---------------------

const levels = ['simple', 'normal', 'advanced']

const DescriptionSchemaZod = z.object({
  level: z.string().refine((str) => levels.includes(str), {
    error: 'Level must be either normal, simple or advanced',
  }),
  text: z.string(),
  duration: z.number().min(0),
})

export type Description = z.infer<typeof DescriptionSchemaZod>
export const Description = { validate: makeZodValidator(DescriptionSchemaZod) }

// --------------
// ITEM VALIDATOR
// --------------

const ItemSchemaZod = z.object({
  name: z.string(),
  itemType: z.enum(ItemType),
  itemAuthor: objectIdZod,
  tour: objectIdZod,
  explanations: z.array(DescriptionSchemaZod),
  license: z.string(),
  tags: z.array(z.string()).optional(),
  images: z.array(objectIdZod).optional(),
  position: PositionSchemaZod.optional(),
})

export type Item = z.infer<typeof ItemSchemaZod>
export const Item = { validate: makeZodValidator(ItemSchemaZod) }
