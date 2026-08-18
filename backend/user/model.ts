import mongoose, { Schema, Document, Types } from 'mongoose'
import { Role } from '../accessControl.js'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'
import z from 'zod'

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

interface _User {
  username: string
  password: string
  email: string
  role: Role
  profilePicture?: Types.ObjectId
  authoredTours: Types.ObjectId[]
  purchasedTours: Types.ObjectId[]
  billingData: IUserBillingData
}
export interface IUser extends Document, _User {}

export type PrivateUser = {
  username: string
  email: string
  _id: Types.ObjectId
}

export function toPrivateUser(user: IUser): PrivateUser {
  return { username: user.username, email: user.email, _id: user._id }
}

export const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: Role,
    },
    profilePicture: { type: Schema.Types.ObjectId, ref: 'Asset' },
    authoredTours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
    purchasedTours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
    billingData: userBillingDataSchema,
  },
  { timestamps: true },
)

export const User = mongoose.model<IUser>('User', userSchema)

const UserBaseSchemaZod = z.object({
  username: z.string(),
  email: z.string(),
  profilePicture: objectIdZod.optional(),
})

const UserQuerySchemaZod = UserBaseSchemaZod.extend({
  role: z.string(),
  authoredTours: z.array(objectIdZod).optional(), // Tour
})

const UserInputSchemaZod = UserBaseSchemaZod.extend({
  password: z.string(),
})

const UserPatchSchemaZod = UserInputSchemaZod.partial()

export type UserQuery = z.infer<typeof UserQuerySchemaZod>
export const UserQuery = { validate: makeZodValidator(UserQuerySchemaZod) }

export type UserPatch = z.infer<typeof UserPatchSchemaZod>
export const UserPatch = { validate: makeZodValidator(UserPatchSchemaZod) }

export type UserInput = z.infer<typeof UserInputSchemaZod>
export const UserInput = { validate: makeZodValidator(UserInputSchemaZod) }

export const publicUserFields: (keyof _User)[] = [
  'username',
  'email',
  'profilePicture',
  'authoredTours',
]

export const privateUserFields: (keyof _User)[] = [
  ...publicUserFields,
  'role',
  'purchasedTours',
  'billingData',
]

export const UserCardSchema = z.object({
  // TODO: refine
  brand: z.string(),
  last4: z.string(),
  expMonth: z.number(),
  expYear: z.number(),
  cardholderName: z.string(),
})

export const UserAddressSchema = z.object({
  // TODO: refine with lib?
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
})

export const UserBillingDataSchema = z.object({
  cards: z.array(UserCardSchema),
  addresses: z.array(UserAddressSchema),
})

export const SignupInputSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
  profilePicture: z.any().optional(),
  billingData: UserBillingDataSchema.optional(),
})

export type SignupInput = z.infer<typeof SignupInputSchema>
export const SignupInput = {
  validate: makeZodValidator(SignupInputSchema),
}
