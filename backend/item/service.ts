import {
  Item,
  IItem,
  ItemQuery,
  ItemInput,
  safeItemFields,
  ItemPatch,
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
  validationError,
  ValidationError,
} from '../shared/errors.js'
import { User } from '../user/model.js'
import { project } from '../shared/utils.js'
import { Tour } from '../tour/model.js'

async function getItem(
  id: Types.ObjectId,
  userID: Types.ObjectId,
): Promise<
  Either<NotFound | DBError | AccessDenied | ValidationError, Partial<IItem>>
> {
  const userResult = await _getById(userID, User)
  if (userResult.isLeft()) return userResult
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'view:item')) return Left(accessDenied())

  const itemResult = await _getById(id, Item)
  if (itemResult.isLeft()) return itemResult
  const item = itemResult.unsafeCoerce()

  // Check if user is author, purchaser, or admin
  const tourId = new Types.ObjectId(item.tour)
  if (
    user.authoredTours.includes(tourId) ||
    user.purchasedTours.includes(tourId) ||
    user.role === Role['Admin'] ||
    item.itemAuthor.equals(userID)
  )
    return Right(project(safeItemFields, item))

  return Left(accessDenied())
}

async function listItems(
  query: ItemQuery,
): Promise<Either<NotFound | DBError, Partial<IItem>[]>> {
  try {
    const items = await Item.find(query).lean().exec()
    return items
      ? Right(items.map((item) => project(safeItemFields, item)))
      : Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function createItem(
  input: ItemInput,
  userId: Types.ObjectId,
): Promise<
  Either<DBError | AccessDenied | ValidationError | NotFound, Partial<IItem>>
> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'create:item')) return Left(accessDenied())

  const tourId = new Types.ObjectId(input.tour)
  // Check referenced Tour exists first
  const tourResult = await _getById(tourId, Tour)
  if (tourResult.isLeft())
    return Left(validationError('tour', 'Tour not found.'))

  // Check referenced itemAuthor exists
  const authResult = await _getById(new Types.ObjectId(input.itemAuthor), User)
  if (authResult.isLeft())
    return Left(validationError('itemAuthor', 'Item author not found.'))

  // Ownership & authoring rules
  if (user.role !== Role['Admin']) {
    if (!new Types.ObjectId(input.itemAuthor).equals(userId))
      return Left(
        validationError('itemAuthor', 'Logged user is not the author.'),
      )
    if (!user.authoredTours.includes(tourId))
      return Left(validationError('tour', "Tour isn't authored."))
  }

  try {
    const item = await Item.create(input)
    if (!item) return Left(notFound())
    const res = await Tour.findByIdAndUpdate(
      item.tour,
      {
        $push: { items: item._id },
      },
      { new: true },
    )
    if (!res) {
      await Item.findByIdAndDelete(item._id)
      return Left(dbError('Could not create item.'))
    }
    return Right(project(safeItemFields, item))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function patchItem(
  id: Types.ObjectId,
  input: ItemPatch,
  userId: Types.ObjectId,
): Promise<
  Either<DBError | AccessDenied | NotFound | ValidationError, Partial<IItem>>
> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'edit:item'))
    return Left(accessDenied(`Your role, ${user.role}, cannot edit items.`))

  // Must load the item to check authorship and ownership
  const itemResult = await _getById(id, Item)
  if (itemResult.isLeft()) return itemResult
  const item = itemResult.unsafeCoerce()

  // Only admin or author can edit
  if (user.role !== Role['Admin']) {
    if (!item.itemAuthor.equals(userId)) {
      return Left(accessDenied('Not the author.'))
    }
    // If patch includes 'tour', check user authorship of updated tour
    if ('tour' in input && input.tour) {
      const patchTourId = new Types.ObjectId(input.tour)
      // Check the new tour exists
      const tourResult = await _getById(patchTourId, Tour)
      if (tourResult.isLeft())
        return Left(validationError('tour', 'Tour not found.'))
      if (
        !user.authoredTours
          .map((t) => t.toString())
          .includes(patchTourId.toString())
      ) {
        return Left(validationError('tour', "Tour isn't authored."))
      }
    }
  }

  try {
    const item = await Item.findByIdAndUpdate(id, input, { new: true })
    if (item) return Right(project(safeItemFields, item))
    else return Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function deleteItem(
  id: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<
  Either<AccessDenied | NotFound | DBError | ValidationError, Partial<IItem>>
> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) {
    const error = userResult.extract()
    return error.type === 'NotFound' ? Left(accessDenied()) : Left(error)
  }

  const itemResult = await _getById(id, Item)
  if (itemResult.isLeft()) return itemResult
  const item = itemResult.unsafeCoerce()
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'delete:item')) return Left(accessDenied())

  if (user.role !== Role['Admin']) {
    // Only author can delete
    if (!item.itemAuthor || !item.itemAuthor.equals(userId))
      return Left(accessDenied())
  }

  try {
    const tourId = item.tour
    await item.deleteOne()
    const promise = (await _getById(tourId, Tour)).chain((tour) => {
      tour.items = tour.items.filter((item) => item._id !== id)
      tour.itemNav = tour.itemNav.filter((item) => item._id !== id)
      return Right(tour.save())
    })
    if (promise.isRight()) {
      await promise.unsafeCoerce()
    }
    return Right(project(safeItemFields, item))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

export default {
  createItem,
  getItem,
  listItems,
  patchItem,
  deleteItem,
}
