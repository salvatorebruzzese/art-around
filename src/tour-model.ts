import mongoose, { Schema, Document, Types } from 'mongoose'
import {
  IReview,
  reviewSchema,
  ITourPrice,
  tourPriceSchema,
} from './shared/models.js'

export interface ITour extends Document {
  name: string
  author?: Types.ObjectId
  thumbnail?: Types.ObjectId
  images?: Types.ObjectId[]
  items?: Types.ObjectId[]
  description?: string
  reviews?: IReview[]
  price?: ITourPrice
}

export const tourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    description: { type: String },
    reviews: [reviewSchema],
    price: tourPriceSchema,
  },
  { timestamps: true },
)

export const Tour = mongoose.model<ITour>('Tour', tourSchema)
