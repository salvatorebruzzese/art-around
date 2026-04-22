import bcrypt from 'bcrypt'
import { err, ok, Result } from 'neverthrow'
import { User, IUser } from './model.js'

export type SignupInput = {
  username: string
  password: string
}

export type AuthServiceError =
  | { type: 'ValidationError'; message: string }
  | { type: 'Conflict'; message: string }
  | { type: 'DBError'; details: string }

export async function signupService(
  input: SignupInput,
): Promise<Result<IUser, AuthServiceError>> {
  const { username, password } = input
  if (!username || !password) {
    return err({
      type: 'ValidationError',
      message: 'Username and password required',
    })
  }
  try {
    const existing = await User.findOne({ username })
    if (existing) {
      return err({ type: 'Conflict', message: 'Username already taken' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ username, password: hashed })
    return ok(user)
  } catch (e) {
    return err({ type: 'DBError', details: String(e) })
  }
}
