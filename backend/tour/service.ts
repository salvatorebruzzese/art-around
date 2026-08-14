import {
  Tour,
  ITour,
  TourQuery,
  TourInput,
  TourPatch,
  safeTourFields,
} from './model.js'
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
import { project } from '../shared/utils.js'

async function getTour(
  id: Types.ObjectId,
  userID: Types.ObjectId,
): Promise<Either<NotFound | DBError | AccessDenied, Partial<ITour>>> {
  const userResult = await _getById(userID, User)
  if (userResult.isLeft()) return userResult
  const user = userResult.unsafeCoerce()

  // HACK: Treat tour as its meta
  if (
    !(/*(*/ checkRole(user.role, 'view:tour')) /* ||
      // !user.purchasedTours.includes(id) ||
      // !user.authoredTours.includes(id)) */ &&
    user.role != 'Admin'
  )
    return Left(accessDenied())

  const res = await _getById(id, Tour)
  if (res.isLeft()) return res
  else return Right(project(safeTourFields, res.unsafeCoerce()))
}

async function listTours(
  query: TourQuery,
): Promise<Either<NotFound | DBError, Partial<ITour>[]>> {
  try {
    const tours = await Tour.find(query).lean().exec()
    return tours
      ? Right(tours.map((tour) => project(safeTourFields, tour))) // TODO: safeTourFields -> metaTourFields
      : Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function createTour(
  input: TourInput,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied, Partial<ITour>>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'create:tour')) return Left(accessDenied())
  // DONE(Router): check if user is author in input

  try {
    const tour = await Tour.create(input)
    await User.findByIdAndUpdate(userId, {
      $push: { authoredTours: tour._id },
    })
    return Right(project(safeTourFields, tour))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function patchTour(
  id: Types.ObjectId,
  input: TourPatch,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied | NotFound, Partial<ITour>>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'edit:tour')) return Left(accessDenied())
  // DONE: only allow if user is author; needs loading the Tour (see below)

  try {
    const tour = await Tour.findByIdAndUpdate(id, input)
    if (tour) {
      if (tour.author != userId && user.role != 'Admin')
        return Left(accessDenied())
      return Right(project(safeTourFields, tour))
    } else return Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function deleteTour(
  id: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<Either<AccessDenied | NotFound | DBError, Partial<ITour>>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) {
    const error = userResult.extract()
    return error.type === 'NotFound' ? Left(accessDenied()) : Left(error)
  }

  const tourResult = await _getById(id, Tour)
  if (tourResult.isLeft()) return tourResult

  const user = userResult.unsafeCoerce()
  const tour = tourResult.unsafeCoerce()

  if (
    (!checkRole(user.role, 'delete:tour') || !tour.author.equals(userId)) &&
    user.role != 'Admin'
  )
    return Left(accessDenied())

  try {
    await tour.deleteOne()
    return Right(project(safeTourFields, tour))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

// TODO: forkTour PUT(/tour/:id) (?)

export default {
  createTour,
  getTour,
  listTours,
  patchTour,
  deleteTour,
}
