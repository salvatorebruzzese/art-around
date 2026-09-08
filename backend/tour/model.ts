import mongoose, { Schema, Document, Types } from 'mongoose'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'
import z from 'zod'

export interface QuizQuestion {
  prompt: string
  options: string[]
  correct: number
  timeLimit: number
}

export interface Quiz {
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  answers: number[]
  submittedAt: Date
}

interface _Tour {
  name: string
  author: Types.ObjectId
  museum: Types.ObjectId
  thumbnail?: Types.ObjectId
  items: Types.ObjectId[]
  itemNav: Types.ObjectId[]
  description?: string
  price: number
  quiz: Quiz
}

export interface ITour extends Document, _Tour {}

export const tourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    museum: { type: Schema.Types.ObjectId, ref: 'Museum' },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    itemNav: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    description: { type: String },
    price: { type: Number },
    quiz: {
      questions: [
        {
          prompt: { type: String, required: true },
          options: [{ type: String, required: true }],
          correct: { type: Number, required: true },
          timeLimit: { type: Number, required: true },
        },
      ],
    },
  },
  { timestamps: true },
)

export const Tour = mongoose.model<ITour>('Tour', tourSchema)

// --------------
// TOUR VALIDATOR
// --------------

const TourInputSchemaZod = z.object({
  name: z.string(),
  author: objectIdZod,
  price: z.number(),
  museum: objectIdZod,
  items: z.array(objectIdZod),
  itemNav: z.array(objectIdZod),
  thumbnail: objectIdZod.optional(),
  description: z.string().optional(),
  quiz: z.object({
    questions: z.array(
      z.object({
        prompt: z.string(),
        options: z.array(z.string()),
        correct: z.number(),
        timeLimit: z.number(),
      }),
    ),
  }),
})

const TourQuerySchemaZod = z.object({
  name: z.string().optional(),
  author: objectIdZod.optional(),
  price: z.number().optional(), // TODO: make into range
  museum: objectIdZod.optional(),
  items: z.array(objectIdZod).optional(),
  thumbnail: objectIdZod.optional(),
  description: z.string().optional(),
})

const TourPatchSchemaZod = TourInputSchemaZod.partial()

export type TourInput = z.infer<typeof TourInputSchemaZod>
export const TourInput = { validate: makeZodValidator(TourInputSchemaZod) }

export type TourQuery = z.infer<typeof TourQuerySchemaZod>
export const TourQuery = { validate: makeZodValidator(TourQuerySchemaZod) }

export type TourPatch = z.infer<typeof TourPatchSchemaZod>
export const TourPatch = { validate: makeZodValidator(TourPatchSchemaZod) }

export const safeTourFields: (keyof _Tour)[] = [
  'name',
  'author',
  'items',
  'itemNav',
  'price',
  'museum',
  'description',
  'thumbnail',
  // fill as needed
]
