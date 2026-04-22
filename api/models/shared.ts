import { Schema, Types } from 'mongoose'

export interface IGeoPosition {
  type: 'Point'
  coordinates: [number, number]
}

export const geoPositionSchema = new Schema<IGeoPosition>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v: number[]) {
          return v.length === 2
        },
        message:
          'Coordinates must be an array of two numbers [longitude, latitude]',
      },
    },
  },
  { _id: false },
)

export interface IReview {
  user: Types.ObjectId
  rating: number
  comment?: string
  createdAt?: Date
}

export const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

export interface ITourPrice {
  amount: number
  currency: string
  forSale: boolean
}

export const tourPriceSchema = new Schema<ITourPrice>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    forSale: { type: Boolean, default: false },
  },
  { _id: false },
)
