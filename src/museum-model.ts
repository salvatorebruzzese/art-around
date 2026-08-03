import mongoose, { Schema, Document, Types } from 'mongoose'

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
