import mongoose, { Schema, Document, Types } from 'mongoose'
import { Role } from './accessControl.js'

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

export const Position = mongoose.model<IGeoPosition>(
  'Position',
  geoPositionSchema,
)

// ==========================================
// REVIEW MODEL
// ==========================================

export interface IReview {
  user: Types.ObjectId
  rating: number
  createdAt: Date
  comment?: string
}

export const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now, required: true },
    comment: { type: String },
  },
  { _id: false },
)

export const Review = mongoose.model<IReview>('Review', reviewSchema)

// ==========================================
// USER MODEL
// ==========================================

export interface IUser extends Document {
  username: string
  password: string
  roles: Role[]
  currentBalance: number
  profilePicture?: Types.ObjectId
  authoredTours?: Types.ObjectId[]
  purchasedTours?: Types.ObjectId[]
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
    roles: [{ type: String, required: true }],
    currentBalance: { type: Number, required: true, default: 0 },
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
  items: Types.ObjectId[]
  thumbnail?: Types.ObjectId
  images?: Types.ObjectId[]
  description?: string
  reviews?: IReview[]
}

export const tourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item', required: true }],
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    description: { type: String },
    reviews: [reviewSchema],
  },
  { timestamps: true },
)

export const Tour = mongoose.model<ITour>('Tour', tourSchema)

// ==========================================
// EXPLANATION MODELS
// ==========================================

export interface IExplanation {
  level: 'simple' | 'normal' | 'advanced'
  text: string
  durationSeconds: number // Natural number
}

export const explanationSchema = new Schema<IExplanation>(
  {
    level: {
      type: String,
      enum: ['simple', 'normal', 'advanced'],
      required: true,
    },
    text: { type: String, required: true },
    durationSeconds: {
      type: Number,
      required: true,
      min: [0, 'Duration must be a natural number'],
      validate: {
        validator: Number.isInteger,
        message: 'Duration must be an integer',
      },
    },
  },
  { _id: false },
)

export enum ItemType {
  Author = 'author',
  Style = 'style',
  Technique = 'technique',
  Artwork = 'artwork',
  Other = 'other',
}

// ==========================================
// ITEM MODEL
// ==========================================

export interface IItem extends Document {
  name: string
  itemType: ItemType
  itemAuthor: Types.ObjectId
  tour: Types.ObjectId
  explanations: IExplanation[]
  license: string
  tags?: string[]
  images?: Types.ObjectId[]
  position?: IGeoPosition
}

export const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    itemAuthor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    explanations: {
      type: [explanationSchema],
      required: true,
      validate: [
        (v: IExplanation[]) => v.length > 0,
        'Must have at least one explanation',
      ],
    },
    license: String,
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    tags: [{ type: String }],
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  },
  { discriminatorKey: 'itemType', collection: 'items', timestamps: true },
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
