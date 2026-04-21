import mongoose, { Schema, Document, Types } from 'mongoose'
export interface IAsset extends Document {
  data: Buffer
  datatype: string
  metadata?: any
}

export interface IUser extends Document {
  username: string
  password: string
  // Add more user fields here if needed
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
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
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
