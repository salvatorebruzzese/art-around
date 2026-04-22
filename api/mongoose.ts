import mongoose, { Schema, Document, Types } from 'mongoose'
export interface IAsset extends Document {
  data: Buffer
  datatype: string
}

export interface IItem extends Document {
  name: string
  tags?: string[]
  tour?: Types.ObjectId
  images?: Types.ObjectId[]
  description?: string
}

export interface IMuseum extends Document {
  name: string
  thumbnail?: Types.ObjectId
  description?: string
  address?: string
  items?: Types.ObjectId[]
}

export interface ITour extends Document {
  name: string
  author?: Types.ObjectId
  thumbnail?: Types.ObjectId
  museums?: Types.ObjectId[]
  description?: string
  // more fields...
}

// === Schemas ===
const assetSchema = new Schema<IAsset>(
  {
    data: { type: Buffer, required: true },
    datatype: { type: String, required: true },
  },
  { timestamps: true },
)

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

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    tags: [{ type: String }],
    tour: { type: Schema.Types.ObjectId, ref: 'Tour' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    description: { type: String },
  },
  { timestamps: true },
)

const museumSchema = new Schema<IMuseum>(
  {
    name: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    description: { type: String },
    address: { type: String },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  },
  { timestamps: true },
)

const tourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    museums: [{ type: Schema.Types.ObjectId, ref: 'Museum' }],
    description: { type: String },
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
