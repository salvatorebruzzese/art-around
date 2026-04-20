import mongoose from 'mongoose'
import { Schema, Buffer } from 'mongoose'

// Asset Schema
const assetSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    datatype: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

// User Schema (Da definire, placeholder)
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    // Altri campi da definire
  },
  { timestamps: true },
)

// Item Schema
const itemSchema = new Schema(
  {
    name: { type: String, required: true },
    tags: [{ type: String }],
    museum: { type: Schema.Types.ObjectId, ref: 'Museum' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    description: { type: String },
  },
  { timestamps: true },
)

// Museum Schema
const museumSchema = new Schema(
  {
    name: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    description: { type: String },
    address: { type: String },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }], // REVIEW: vogliamo ciò?
  },
  { timestamps: true },
)

// Tour Schema
const tourSchema = new Schema(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Asset' },
    museums: [{ type: Schema.Types.ObjectId, ref: 'Museum' }],
    description: { type: String },
    // altri campi rilevanti
  },
  { timestamps: true },
)

export default {
  Asset: mongoose.model('Asset', assetSchema),
  User: mongoose.model('User', userSchema),
  Item: mongoose.model('Item', itemSchema),
  Museum: mongoose.model('Museum', museumSchema),
  Tour: mongoose.model('Tour', tourSchema),
}
