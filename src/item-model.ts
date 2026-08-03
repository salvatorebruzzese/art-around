import mongoose, { Schema, Document, Types } from 'mongoose'
import { IGeoPosition, geoPositionSchema } from './shared/models.js'

export interface IItem extends Document {
  name: string
  tour: Types.ObjectId
  tags?: string[]
  images?: Types.ObjectId[]
  description?: string
  position?: IGeoPosition
}

export const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    tags: [{ type: String }],
    tour: { type: Schema.Types.ObjectId, ref: 'Tour' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    description: { type: String },
    position: { type: geoPositionSchema, required: false },
  },
  { timestamps: true },
)

export const Item = mongoose.model<IItem>('Item', itemSchema)
