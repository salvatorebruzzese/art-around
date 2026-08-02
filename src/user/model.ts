import mongoose, { Schema, Document, Types } from 'mongoose'
import { Role } from '../shared/models.js'

export interface IUserCard {
  brand: string
  last4: string
  expMonth: number
  expYear: number
  cardholderName: string
}
export const userCardSchema = new Schema<IUserCard>(
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
export const userAddressSchema = new Schema<IUserAddress>(
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
export const userBillingDataSchema = new Schema<IUserBillingData>(
  {
    cards: [userCardSchema],
    addresses: [userAddressSchema],
  },
  { _id: false },
)

export interface IUser extends Document {
  username: string
  password: string
  roles: Role[]
  profilePicture?: Types.ObjectId
  authoredTours: Types.ObjectId[]
  purchasedTours: Types.ObjectId[]
  billingData: IUserBillingData
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
    billingData: userBillingDataSchema,
  },
  { timestamps: true },
)

export const User = mongoose.model<IUser>('User', userSchema)
