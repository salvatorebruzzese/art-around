import mongoose, { Schema, Document, Types } from 'mongoose'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'
import z from 'zod'
import { Projection } from '../shared/utils.js'

export interface IReview {
  user: Types.ObjectId
  rating: number
  comment?: string
  createdAt?: Date
}

interface _Tour {
  name: string
  author: Types.ObjectId
  thumbnail?: Types.ObjectId
  images?: Types.ObjectId[]
  items: Types.ObjectId[]
  description?: string
  reviews?: IReview[]
  price: number
}

export interface ITour extends Document, _Tour {}

export const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

export const tourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    description: { type: String },
    reviews: [reviewSchema],
    price: { type: Number },
  },
  { timestamps: true },
)

export const Tour = mongoose.model<ITour>('Tour', tourSchema)

// ----------------
// REVIEW VALIDATOR
// ----------------

const ReviewInputSchemaZod = z.object({
  user: objectIdZod,
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

const ReviewQuerySchemaZod = z.object({
  user: objectIdZod.optional(),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional().optional(),
})
export type ReviewInput = z.infer<typeof ReviewInputSchemaZod>
export const ReviewInput = { validate: makeZodValidator(ReviewInputSchemaZod) }

export type ReviewQuery = ReviewInput
export const ReviewQuery = ReviewInput

// --------------
// TOUR VALIDATOR
// --------------

const TourInputSchemaZod = z.object({
  name: z.string(),
  author: objectIdZod,
  price: z.number(),
  items: z.array(objectIdZod),
  thumbnail: objectIdZod.optional(),
  images: z.array(objectIdZod).optional(),
  description: z.string().optional(),
})

const TourQuerySchemaZod = z.object({
  name: z.string().optional(),
  author: objectIdZod.optional(),
  price: z.number().optional(), // TODO: make into range
  items: z.array(objectIdZod).optional(),
  thumbnail: objectIdZod.optional(),
  images: z.array(objectIdZod).optional(),
  description: z.string().optional(),
  reviews: z.array(ReviewQuerySchemaZod).optional(), // TODO: Does this "work"?
})

const TourPatchSchemaZod = TourInputSchemaZod.partial()

export type TourInput = z.infer<typeof TourInputSchemaZod>
export const TourInput = { validate: makeZodValidator(TourInputSchemaZod) }

export type TourQuery = z.infer<typeof TourQuerySchemaZod>
export const TourQuery = { validate: makeZodValidator(TourQuerySchemaZod) }

export type TourPatch = z.infer<typeof TourPatchSchemaZod>
export const TourPatch = { validate: makeZodValidator(TourPatchSchemaZod) }

export const safeTourFields: Projection<_Tour> = {
  name: 1,
  author: 1,
  items: 1,
  price: 1,
  description: 1,
  // fill as needed
}
