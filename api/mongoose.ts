import mongoose, { Schema, Document, Types } from 'mongoose'

// ===========================
//          ASSET
// ===========================
export interface IAsset extends Document {
  data: Buffer
  datatype: string
}

const assetSchema = new Schema<IAsset>(
  {
    data: { type: Buffer, required: true },
    datatype: { type: String, required: true },
  },
  { timestamps: true },
)

// ===========================
//            USER
// ===========================

export interface IUserCard {
  brand: string
  last4: string
  expMonth: number
  expYear: number
  cardholderName: string
}

const userCardSchema = new Schema<IUserCard>(
  {
    brand: { type: String, required: true },
    last4: { type: String, required: true },
    expMonth: { type: Number, required: true },
    expYear: { type: Number, required: true },
    cardholderName: { type: String, required: true },
  },
  { _id: false },
)

export interface IUserAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

const userAddressSchema = new Schema<IUserAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
)

export interface IUserBillingData {
  cards: IUserCard[]
  addresses: IUserAddress[]
}

const userBillingDataSchema = new Schema<IUserBillingData>(
  {
    cards: [userCardSchema],
    addresses: [userAddressSchema],
  },
  { _id: false },
)
export interface IUser extends Document {
  username: string
  password: string
  profilePicture?: Schema.Types.ObjectId
  authoredTours: Schema.Types.ObjectId[]
  purchasedTours: Schema.Types.ObjectId[]
  billingData: IUserBillingData
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    profilePicture: { type: Schema.Types.ObjectId, ref: 'Asset' },
    authoredTours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
    purchasedTours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
    billingData: userBillingDataSchema,
  },
  { timestamps: true },
)

export interface IGeoPosition {
  type: 'Point'
  coordinates: [number, number]
}

const geoPositionSchema = new Schema<IGeoPosition>(
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

export interface IItem extends Document {
  name: string
  tags?: string[]
  tour?: Types.ObjectId
  images?: Types.ObjectId[]
  description?: string
  position?: IGeoPosition
}

const itemSchema = new Schema<IItem>(
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
export interface IMuseum extends Document {
  name: string
  thumbnail?: Types.ObjectId
  description?: string
  address?: string
  tours?: Types.ObjectId[]
}

const museumSchema = new Schema<IMuseum>(
  {
    name: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    description: { type: String },
    address: { type: String },
    tours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
  },
  { timestamps: true },
)

export interface IReview {
  user: Types.ObjectId
  rating: number
  comment?: string
  createdAt?: Date
}

const reviewSchema = new Schema<IReview>(
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

const tourPriceSchema = new Schema<ITourPrice>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    forSale: { type: Boolean, default: false },
  },
  { _id: false },
)

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

const tourSchema = new Schema<ITour>(
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

// === Models ===
export const Asset = mongoose.model<IAsset>('Asset', assetSchema)
export const User = mongoose.model<IUser>('User', userSchema)
export const Item = mongoose.model<IItem>('Item', itemSchema)
export const Museum = mongoose.model<IMuseum>('Museum', museumSchema)
export const Tour = mongoose.model<ITour>('Tour', tourSchema)

// If you want to keep a single default export for backwards compatibility:
export default {
  Asset,
  User,
  Item,
  Museum,
  Tour,
}
