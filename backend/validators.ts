import z from 'zod'
import { isValidObjectId } from 'mongoose'
import { Either, Left, Right } from 'purify-ts/Either'
import { ItemType } from './models.js'
import { ValidationError, validationError } from './errors.js'

function validate<T extends z.ZodType>(
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
  profilePicture: objectIdZod.optional(),
})

const UserQuerySchemaZod = UserBaseSchemaZod.extend({
  role: z.string(),
  authoredTours: z.array(objectIdZod).optional(), // Tour
})

const UserInputSchemaZod = UserBaseSchemaZod.extend({
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
  items: z.array(objectIdZod),
  thumbnail: objectIdZod.optional(),
  images: z.array(objectIdZod).optional(),
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
})

export type Item = z.infer<typeof ItemSchemaZod>
export const Item = { validate: makeZodValidator(ItemSchemaZod) }

// -----------
// ASSET VALIDATOR
// -----------

const AssetSchemaZod = z.object({
  data: z.any(), // Buffer
  datatype: z.string(),
})

export type Asset = z.infer<typeof AssetSchemaZod>
export const Asset = { validate: makeZodValidator(AssetSchemaZod) }

// ----------------
// ARTIST VALIDATOR
// ----------------

const ArtistSchemaZod = ItemSchemaZod.extend({
  birthDate: z.string().optional(), // ISO-8601 string
  deathDate: z.string().optional(), // ISO-8601 string
})

export type Artist = z.infer<typeof ArtistSchemaZod>
export const Artist = { validate: makeZodValidator(ArtistSchemaZod) }

// ------------------
// TECHNIQUE VALIDATOR
// ------------------

const TechniqueSchemaZod = ItemSchemaZod.extend({
  keyExponents: z.array(objectIdZod).optional(),
  essentialTools: z.array(z.string()).optional(),
})

export type Technique = z.infer<typeof TechniqueSchemaZod>
export const Technique = { validate: makeZodValidator(TechniqueSchemaZod) }

// --------------
// STYLE VALIDATOR
// --------------

const StyleSchemaZod = ItemSchemaZod.extend({
  historicalPeriod: z.string().optional(),
  keyExponents: z.array(objectIdZod).optional(),
})

export type Style = z.infer<typeof StyleSchemaZod>
export const Style = { validate: makeZodValidator(StyleSchemaZod) }

// ----------------
// ARTWORK VALIDATOR
// ----------------

const ArtworkSchemaZod = ItemSchemaZod.extend({
  artists: z.array(objectIdZod),
  style: objectIdZod.optional(),
  technique: objectIdZod.optional(),
  creationPeriod: z.string().optional(),
  position: PositionSchemaZod.optional(),
  image: objectIdZod.optional(),
})

export type Artwork = z.infer<typeof ArtworkSchemaZod>
export const Artwork = { validate: makeZodValidator(ArtworkSchemaZod) }

// ------------
// MUSEUM VALIDATOR
// ------------

const MuseumSchemaZod = z.object({
  name: z.string(),
  thumbnail: objectIdZod.optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  tours: z.array(objectIdZod).optional(),
})

export type Museum = z.infer<typeof MuseumSchemaZod>
export const Museum = { validate: makeZodValidator(MuseumSchemaZod) }
