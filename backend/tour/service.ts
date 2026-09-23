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
import { _getById, checkRole, Role } from '../accessControl.js'
import {
  accessDenied,
  AccessDenied,
  dbError,
  DBError,
  notFound,
  NotFound,
} from '../shared/errors.js'
import { User } from '../user/model.js'
import { Item } from '../item/model.js'
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
    user.role != Role['Admin']
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
    /* TODO: check findByIdAndUpdate */
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

  if (!checkRole(user.role, 'edit:tour'))
    return Left(accessDenied("Can't edit tours."))

  // Check author authorization BEFORE updating
  try {
    const tourCheck = await Tour.findById(id)
    if (!tourCheck) return Left(notFound())
    if (!tourCheck.author.equals(userId) && user.role != Role['Admin'])
      return Left(accessDenied('You are not the author.'))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }

  try {
    const tour = await Tour.findByIdAndUpdate(id, input, { new: true })
    if (tour) {
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
    user.role != Role['Admin']
  )
    return Left(accessDenied())

  try {
    // 1. Find all items in this tour
    const items = await Item.find({ tour: id }).exec()

    // 2. Delete each item and clean up their bidirectional references
    for (const item of items) {
      // Remove this item from all other items' refs arrays
      await Item.updateMany({ refs: item._id }, { $pull: { refs: item._id } })
      // Delete the item
      await item.deleteOne()
    }

    // 3. Clean user references (remove tour from all users who authored or purchased it)
    await User.updateMany(
      { authoredTours: id },
      { $pull: { authoredTours: id } },
    )
    await User.updateMany(
      { purchasedTours: id },
      { $pull: { purchasedTours: id } },
    )

    // 4. Delete the tour
    await tour.deleteOne()
    return Right(project(safeTourFields, tour))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function forkTour(
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
  const sourceTour = tourResult.unsafeCoerce()

  // Permission check: Admin OR author OR purchaser can fork
  if (user.role !== Role['Admin']) {
    const isAuthor = sourceTour.author.equals(userId)
    const isPurchaser = user.purchasedTours.includes(id)
    if (!isAuthor && !isPurchaser) return Left(accessDenied())
  }

  try {
    // 1. Load all items from source tour
    const sourceItems = await Item.find({ tour: id }).exec()

    // 2. Create new tour with copied fields
    const newTour = await Tour.create({
      name: sourceTour.name + ' (Copia)',
      author: userId, // Current user becomes author
      museum: sourceTour.museum,
      thumbnail: sourceTour.thumbnail, // Reference same asset (lazy)
      map: sourceTour.map, // Reference same asset (lazy)
      items: [], // Will populate
      itemNav: [], // Will populate
      description: sourceTour.description,
      price: sourceTour.price,
      quiz: JSON.parse(JSON.stringify(sourceTour.quiz)), // Deep copy
      tourEntryLocation: sourceTour.tourEntryLocation,
      tourExitLocation: sourceTour.tourExitLocation,
    })

    // 3. Create mapping from old item IDs to new item IDs
    const itemIdMap = new Map<string, Types.ObjectId>()

    // 4. Create all new items (refs empty for now)
    for (const sourceItem of sourceItems) {
      const newItem = await Item.create({
        name: sourceItem.name,
        itemAuthor: userId, // Current user becomes author
        tour: newTour._id,
        explanations: JSON.parse(JSON.stringify(sourceItem.explanations)), // Deep copy
        license: sourceItem.license,
        tags: sourceItem.tags ? [...sourceItem.tags] : [],
        image: sourceItem.image, // Reference same asset (lazy)
        position: sourceItem.position,
        refs: [], // Empty for now, will update in next loop
      })

      itemIdMap.set(sourceItem._id.toString(), newItem._id)
      newTour.items.push(newItem._id)
    }

    // 5. Update itemNav with remapped indices
    for (const oldItemId of sourceTour.itemNav) {
      const newItemId = itemIdMap.get(oldItemId.toString())
      if (newItemId) {
        newTour.itemNav.push(newItemId)
      }
    }

    // 6. Update refs in all new items using the mapping
    for (const sourceItem of sourceItems) {
      const newItemId = itemIdMap.get(sourceItem._id.toString())
      if (newItemId && sourceItem.refs && sourceItem.refs.length > 0) {
        const newItem = await Item.findById(newItemId)
        if (newItem) {
          newItem.refs = sourceItem.refs
            .map((oldRefId) => itemIdMap.get(oldRefId.toString()))
            .filter((id) => id !== undefined) as Types.ObjectId[]
          await newItem.save()
        }
      }
    }

    // 7. Save tour with updated items and itemNav
    await newTour.save()

    // 8. Add forked tour to user's authoredTours
    await User.findByIdAndUpdate(userId, {
      $push: { authoredTours: newTour._id },
    })

    return Right(project(safeTourFields, newTour))
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
  forkTour,
}
