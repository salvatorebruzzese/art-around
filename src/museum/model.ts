import mongoose, { Schema, Document, Types } from 'mongoose'
import z from 'zod'
import { objectIdZod } from '../shared/validation.js'

export interface IMuseum extends Document {
  name: string
  thumbnail?: Types.ObjectId
  description?: string
  address?: string
  tours?: Types.ObjectId[]
}

export const museumSchema = new Schema<IMuseum>(
  {
    name: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    description: { type: String },
    address: { type: String },
    tours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
  },
  { timestamps: true },
)

export const Museum = mongoose.model<IMuseum>('Museum', museumSchema)

const MuseumQuerySchemaZod = z.object({
  name: z.string().optional(),
  description: z.string().optional(), // TODO: partial match
  address: z.string().optional(),
  tours: z.array(objectIdZod).optional(),
})

export type MuseumQuery = z.infer<typeof MuseumQuerySchemaZod>
export const MuseumQuery = { validate: makeZodValidator(MuseumQuerySchemaZod) }
