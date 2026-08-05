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
    user: { type: Schema.ObjectId, ref: 'User', required: true },
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
  role: Role
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
    role: [{ type: String, required: true }],
    currentBalance: { type: Number, required: true, default: 0 },
    profilePicture: { type: Schema.ObjectId, ref: 'Asset' },
    authoredTours: [{ type: Schema.ObjectId, ref: 'Tour' }],
    purchasedTours: [{ type: Schema.ObjectId, ref: 'Tour' }],
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
    author: { type: Schema.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    items: [{ type: Schema.ObjectId, ref: 'Item', required: true }],
    thumbnail: { type: Schema.ObjectId, ref: 'Asset' },
    images: [{ type: Schema.ObjectId, ref: 'Asset' }],
    description: { type: String },
    reviews: [reviewSchema],
  },
  { timestamps: true },
)

export const Tour = mongoose.model<ITour>('Tour', tourSchema)

// ==========================================
// EXPLANATION MODEL
// ==========================================

export interface IDescription {
  level: 'simple' | 'normal' | 'advanced'
  text: string
  durationSeconds: number // Natural number
}

export const explanationSchema = new Schema<IDescription>(
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
  Artist = 'artist',
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
  explanations: IDescription[]
  license: string
  tags?: string[]
  images?: Types.ObjectId[]
  position?: IGeoPosition
}

export const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    itemAuthor: { type: Schema.ObjectId, ref: 'User', required: true },
    explanations: {
      type: [explanationSchema],
      required: true,
      validate: [
        (v: IDescription[]) => v.length > 0,
        'Must have at least one explanation',
      ],
    },
    license: String,
    tour: { type: Schema.ObjectId, ref: 'Tour', required: true },
    tags: [{ type: String }],
    images: [{ type: Schema.ObjectId, ref: 'Asset' }],
  },
  { discriminatorKey: 'itemType', collection: 'items', timestamps: true },
)

export const Item = mongoose.model<IItem>('Item', itemSchema)

// ==========================================
// 1. ARTIST MODEL
// ==========================================

export interface IArtist extends IItem {
  birthDate?: string // ISO-8601 string
  deathDate?: string // ISO-8601 string
}

export const itemArtistSchema = new Schema<IArtist>({
  birthDate: { type: String },
  deathDate: { type: String },
})

export const ItemArtist = Item.discriminator<IArtist>(
  ItemType.Artist,
  itemArtistSchema,
)

// ==========================================
// 2. TECHNIQUE MODEL
// ==========================================

export interface ITechnique extends IItem {
  keyExponents?: Types.ObjectId
  essentialTools?: string[]
}

export const itemTechniqueSchema = new Schema<ITechnique>({
  keyExponents: [{ type: Schema.ObjectId, ref: ItemArtist }],
  essentialTools: [{ type: String }],
})

export const ItemTechnique = Item.discriminator<ITechnique>(
  ItemType.Technique,
  itemTechniqueSchema,
)

// ==========================================
// 3. STYLE MODEL
// ==========================================

export interface IStyle extends IItem {
  historicalPeriod?: string
  keyExponents?: Types.ObjectId[]
}

export const itemStyleSchema = new Schema<IStyle>({
  historicalPeriod: { type: String },
  keyExponents: [{ type: Schema.ObjectId, ref: 'ItemAuthor' }],
})

export const ItemStyle = Item.discriminator<IStyle>(
  ItemType.Style,
  itemStyleSchema,
)

// ==========================================
// 4. ARTWORK MODEL
// ==========================================

export interface IArtwork extends IItem {
  artists: Types.ObjectId[]
  style?: Types.ObjectId
  technique?: Types.ObjectId
  creationPeriod?: string
  position?: IGeoPosition
  image?: Types.ObjectId
}

export const itemArtworkSchema = new Schema<IArtwork>({
  artists: [{ type: Schema.ObjectId, ref: 'ItemArtist', required: true }],
  style: { type: Schema.ObjectId, ref: 'ItemStyle' },
  technique: { type: Schema.ObjectId, ref: 'ItemTechnique' },
  creationPeriod: { type: String },
  position: { type: geoPositionSchema },
  image: { type: Schema.ObjectId, ref: 'Asset' },
})

export const ItemArtwork = Item.discriminator<IArtwork>(
  ItemType.Artwork,
  itemArtworkSchema,
)

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
    thumbnail: { type: Schema.ObjectId, ref: 'Asset' },
    description: { type: String },
    address: { type: String },
    tours: [{ type: Schema.ObjectId, ref: 'Tour' }],
  },
  { timestamps: true },
)

export const Museum = mongoose.model<IMuseum>('Museum', museumSchema)
