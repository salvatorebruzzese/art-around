import mongoose, { Schema, Document, Types } from 'mongoose'
import { Role } from './shared/accessControl.js'

// ==========================================
// POSITION MODEL
// ==========================================

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

// ==========================================
// REVIEW MODEL
// ==========================================

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

// ==========================================
// USER MODEL
// ==========================================

export interface IUser extends Document {
  username: string
  password: string
  roles: Role[]
  profilePicture?: Types.ObjectId
  authoredTours: Types.ObjectId[]
  purchasedTours: Types.ObjectId[]
  currentBalance: number // Let's just add a web page later to load currency, K.I.S.S.
}

export type PublicUser = {
  username: string
  _id: Types.ObjectId
}

export function toPublicUser(user: IUser): PublicUser {
  return { username: user.username, _id: user._id }
}

export const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    profilePicture: { type: Schema.Types.ObjectId, ref: 'Asset' },
    authoredTours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
    purchasedTours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
  },
  { timestamps: true },
)

export const User = mongoose.model<IUser>('User', userSchema)

// ==========================================
// TOUR MODEL
// ==========================================

export interface ITour extends Document {
  name: string
  author: Types.ObjectId
  price: number
  thumbnail?: Types.ObjectId
  images?: Types.ObjectId[]
  items?: Types.ObjectId[]
  description?: string
  reviews?: IReview[]
}

export const tourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    items: [{ type: Schema.Types.ObjectId, ref: 'Item', required: true }],
    description: { type: String },
    reviews: [reviewSchema],
    price: { type: Number, required: true },
  },
  { timestamps: true },
)

export const Tour = mongoose.model<ITour>('Tour', tourSchema)

// ==========================================
// ITEM MODEL
// ==========================================

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

// ==========================================
// ASSET MODEL
// ==========================================

export interface IAsset extends Document {
  data: Buffer
  datatype: string
}

export const assetSchema = new Schema<IAsset>(
  {
    data: { type: Buffer, required: true },
    datatype: { type: String, required: true },
  },
  { timestamps: true },
)

export const Asset = mongoose.model<IAsset>('Asset', assetSchema)

// ==========================================
// MUSEUM MODEL
// ==========================================

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
