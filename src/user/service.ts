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
