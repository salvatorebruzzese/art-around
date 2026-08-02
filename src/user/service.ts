import bcrypt from 'bcrypt'
import { User, IUser } from './model.js'
import { Either, Left, Right } from 'purify-ts'

export type ConflictError = { type: 'ConflictError'; message: string }

async function signup(
  input: SignupInput,
): Promise<Either<ConflictError | DBError, IUser>> {
  let existingUser
  try {
    existingUser = await User.findOne({ username: input.username })
      .lean()
      .exec()
  } catch (e) {
    return Left({ type: 'DBError', message: String(e) })
  }

  if (existingUser) {
    return Left({ type: 'ConflictError', message: 'Username is taken.' })
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(input.password, 10)
    const newUser = await User.create({ ...input, password: hashedPassword })
    return Right(newUser)
  } catch (e) {
    return Left({ type: 'DBError', message: String(e) })
  }
}

export default {
  signup,
}

import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'
import { DBError } from '../shared/errors.js'

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
