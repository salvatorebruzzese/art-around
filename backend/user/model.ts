import mongoose, { Schema, Document, Types } from 'mongoose'
import { Role } from '../accessControl.js'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'
import z from 'zod'

interface _User {
  username: string
  password: string
  email: string
  role: Role
  profilePicture?: Types.ObjectId
  authoredTours: Types.ObjectId[]
  purchasedTours: Types.ObjectId[]
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

const UserPatchSchemaZod = UserInputSchemaZod.extend({
  purchasedTours: z.array(objectIdZod),
}).partial()

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
]

export const SignupInputSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
  profilePicture: z.any().optional(),
})

export type SignupInput = z.infer<typeof SignupInputSchema>
export const SignupInput = {
  validate: makeZodValidator(SignupInputSchema),
}
