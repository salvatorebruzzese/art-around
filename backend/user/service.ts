import bcrypt from 'bcrypt'
import {
  User,
  IUser,
  SignupInput,
  UserQuery,
  UserPatch,
  publicUserFields,
  privateUserFields,
} from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import { _getById, checkRole, Role } from '../accessControl.js'
import {
  accessDenied,
  AccessDenied,
  dbError,
  DBError,
  notFound,
  NotFound,
  ConflictError,
  conflictError,
} from '../shared/errors.js'
import { project } from '../shared/utils.js'

// Signup
async function signup(
  input: SignupInput,
): Promise<Either<ConflictError | DBError, IUser>> {
  let existingUser
  try {
    existingUser = await User.findOne({ username: input.username })
      .lean()
      .exec()
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }

  if (existingUser) {
    return Left(
      conflictError('username', `Username ${input.username} is taken.`),
    )
  }

  try {
    const hashedPassword = await bcrypt.hash(input.password, 10)
    const newUser = await User.create({
      ...input,
      password: hashedPassword,
      role: input.username == 'Admin' ? Role['Admin'] : Role['User'], // TODO: role attribution
    })
    return Right(newUser)
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// Get User
async function getUser(
  id: Types.ObjectId,
  currentUserId: Types.ObjectId,
): Promise<Either<NotFound | DBError | AccessDenied, Partial<IUser>>> {
  const userResult = await _getById(currentUserId, User)
  if (userResult.isLeft()) return userResult
  const currentUser = userResult.unsafeCoerce()

  if (!checkRole(currentUser.role, 'view:user')) {
    return Left(accessDenied())
  }

  const targetResult = await _getById(id, User)
  if (targetResult.isLeft()) return targetResult
  const targetUser = targetResult.unsafeCoerce()

  return Right(
    project(
      id.equals(currentUserId) || currentUser.role == Role['Admin']
        ? privateUserFields
        : publicUserFields,
      targetUser,
    ),
  )
}

// List Users
async function listUsers(
  query: UserQuery,
): Promise<Either<NotFound | DBError, Partial<IUser>[]>> {
  try {
    const users = await User.find(query).lean().exec()
    return users
      ? Right(users.map((user) => project(publicUserFields, user))) // TODO: publicUserFields -> metaUserFields
      : Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// Create User (not signup, admin-invoked, no duplicate username check)
// async function createUser(
//   input: UserInput,
//   currentUserId: Types.ObjectId,
// ): Promise<Either<DBError | AccessDenied, Partial<IUser>>> {
//   const userResult = await _getById(currentUserId, User)
//   if (userResult.isLeft()) return Left(accessDenied())
//   const currentUser = userResult.unsafeCoerce()
//   if (!checkRole(currentUser.role, 'create:user')) return Left(accessDenied())

//   try {
//     const hashedPassword = await bcrypt.hash(input.password, 10)
//     const newUser = await User.create({ ...input, password: hashedPassword })
//     return Right(project(publicUserFields, newUser))
//   } catch (e) {
//     return Left(dbError(undefined, () => String(e)))
//   }
// }

// Patch User
async function patchUser(
  id: Types.ObjectId,
  input: UserPatch,
  currentUserId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied | NotFound, Partial<IUser>>> {
  const userResult = await _getById(currentUserId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const currentUser = userResult.unsafeCoerce()
  if (!checkRole(currentUser.role, 'edit:user')) return Left(accessDenied())
  if (currentUserId != id && currentUser.role != Role['Admin'])
    return Left(accessDenied())

  // Hash password if being changed
  const patch = { ...input }
  if ('password' in patch && patch.password) {
    patch.password = await bcrypt.hash(patch.password, 10)
  }

  try {
    const user = await User.findByIdAndUpdate(id, patch, { new: true })
    if (user) return Right(project(privateUserFields, user))
    else return Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// Delete User
async function deleteUser(
  id: Types.ObjectId,
  currentUserId: Types.ObjectId,
): Promise<Either<AccessDenied | NotFound | DBError, Partial<IUser>>> {
  const userResult = await _getById(currentUserId, User)
  if (userResult.isLeft()) {
    const error = userResult.extract()
    return error.type === 'NotFound' ? Left(accessDenied()) : Left(error)
  }
  const currentUser = userResult.unsafeCoerce()

  const targetResult = await _getById(id, User)
  if (targetResult.isLeft()) return targetResult
  const targetUser = targetResult.unsafeCoerce()

  if (
    (!checkRole(currentUser.role, 'delete:user') || id != targetUser.id) &&
    currentUser.role != Role['Admin']
  )
    return Left(accessDenied())

  try {
    await targetUser.deleteOne()
    return Right(project(privateUserFields, targetUser))
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

export default {
  signup,
  getUser,
  listUsers,
  // createUser,
  patchUser,
  deleteUser,
}
