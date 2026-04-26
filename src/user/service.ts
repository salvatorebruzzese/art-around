import bcrypt from 'bcrypt'
import { User, IUser } from './model.js'
import { EitherAsync } from 'purify-ts'

export type ConflictError = { type: 'ConflictError'; message: string }
export type DBError = { type: 'DBError'; message: string }

function signup(
  input: SignupInput,
): EitherAsync<ConflictError | DBError, IUser> {
  return EitherAsync(async ({ throwE }) => {
    let existingUser
    try {
      existingUser = await User.findOne({ username: input.username })
        .lean()
        .exec()
    } catch (e) {
      return throwE({ type: 'DBError', message: String(e) })
    }

    if (existingUser) {
      return throwE({ type: 'ConflictError', message: 'Username is taken.' })
    }

    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(input.password, 10)
    } catch (e) {
      return throwE({ type: 'DBError', message: String(e) })
    }
    try {
      const newUser = await User.create({ ...input, password: hashedPassword })
      return newUser
    } catch (e) {
      return throwE({ type: 'DBError', message: String(e) })
    }
  })
}

export default {
  signup,
}

import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'

// UserCard
export const UserCardSchema = z.object({
  // TODO: refine
  brand: z.string(),
  last4: z.string(),
  expMonth: z.number(),
  expYear: z.number(),
  cardholderName: z.string(),
})

// UserAddress
export const UserAddressSchema = z.object({
  // TODO: refine with lib?
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
})

// UserBillingData
export const UserBillingDataSchema = z.object({
  cards: z.array(UserCardSchema),
  addresses: z.array(UserAddressSchema),
})

// User
export const SignupInputSchema = z.object({
  username: z.string(),
  password: z.string(),
  profilePicture: z.any().optional(),
  billingData: UserBillingDataSchema.optional(),
})

export type SignupInput = z.infer<typeof SignupInputSchema>
export const SignupInput = {
  validate: makeZodValidator(SignupInputSchema),
}
