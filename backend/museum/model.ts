import mongoose, { Schema, Document, Types } from 'mongoose'
import z from 'zod'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'

export interface IMuseum extends Document {
  name: string
  thumbnail?: Types.ObjectId
  description?: string
  address?: string
  tours?: Types.ObjectId[]
  toilets?: string
  reception?: string
}

export const museumSchema = new Schema<IMuseum>(
  {
    name: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    description: { type: String },
    address: { type: String },
    tours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
    toilets: { type: String },
    reception: { type: String },
  },
  { timestamps: true },
)

export const Museum = mongoose.model<IMuseum>('Museum', museumSchema)

const MuseumQuerySchemaZod = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  tours: z.array(objectIdZod).optional(),
  toilets: z.string().optional(),
  reception: z.string().optional(),
})

export type MuseumQuery = z.infer<typeof MuseumQuerySchemaZod>
export const MuseumQuery = { validate: makeZodValidator(MuseumQuerySchemaZod) }
