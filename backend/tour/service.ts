import { Tour, ITour, TourQuery, TourInput, TourPatch } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import { _getById, checkRole } from '../accessControl.js'
import {
  accessDenied,
  AccessDenied,
  dbError,
  DBError,
  notFound,
  NotFound,
} from '../shared/errors.js'
import { User } from '../user/model.js'

async function getTour(
  id: Types.ObjectId,
  userID: Types.ObjectId,
): Promise<Either<NotFound | DBError | AccessDenied, ITour>> {
  const userResult = await _getById(userID, User)
  if (userResult.isLeft()) return userResult
  const user = userResult.unsafeCoerce()

  // TODO: Update checkRole permission for viewing tours
  if (!checkRole(user.role, 'view:tour')) return Left(accessDenied())

  // TODO: Customize specific logic for who can view the tour
  // Example: all tours are public? Or check if user purchased tour? For now allow with role only

  return _getById(id, Tour)
}

async function listTours(
  query: TourQuery,
): Promise<Either<NotFound | DBError, ITour[]>> {
  try {
    const tours = await Tour.find(query).lean().exec()
    return tours ? Right(tours) : Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function createTour(
  input: TourInput,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied, ITour>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  // TODO: Update for tour creation permissions as appropriate
  if (!checkRole(user.role, 'create:tour')) return Left(accessDenied())
  // Optionally check if user is author in input

  try {
    const tour = await Tour.create(input)
    return Right(tour)
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function patchTour(
  id: Types.ObjectId,
  input: TourPatch,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied | NotFound, ITour>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  // TODO: Update for edit tour permissions as appropriate
  if (!checkRole(user.role, 'edit:tour')) return Left(accessDenied())
  // Optionally only allow if user is author; needs loading the Tour (see below)

  try {
    const tour = await Tour.findByIdAndUpdate(id, input, { new: true })
    if (tour) return Right(tour)
    else return Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function deleteTour(
  id: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<Either<AccessDenied | NotFound | DBError, ITour>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) {
    const error = userResult.extract()
    return error.type === 'NotFound' ? Left(accessDenied()) : Left(error)
  }

  const tourResult = await _getById(id, Tour)
  if (tourResult.isLeft()) return tourResult

  const user = userResult.unsafeCoerce()
  const tour = tourResult.unsafeCoerce()

  // TODO: Update for delete permission; for example, only allow author or 'delete:tour' role
  if (!checkRole(user.role, 'delete:tour')) return Left(accessDenied())
  // Optionally allow author to delete: if (!tour.author.equals(userId)) return Left(accessDenied())

  try {
    await tour.deleteOne()
    return Right(tour)
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

export default {
  createTour,
  getTour,
  listTours,
  patchTour,
  deleteTour,
}
