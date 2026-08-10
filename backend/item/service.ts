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

async function getItem(
  id: Types.ObjectId,
  userID: Types.ObjectId,
): Promise<Either<NotFound | DBError | AccessDenied, IItem>> {
  const userResult = await _getById(userID, User)
  if (userResult.isLeft()) return userResult
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'view:item')) return Left(accessDenied())

  if (user.authoredTours.includes(id) || user.purchasedTours.includes(id)) {
    return _getById(id, Item)
  } else {
    return Left(accessDenied())
  }
}

async function listItems(
  query: ItemQuery,
): Promise<Either<NotFound | DBError, IItem[]>> {
  try {
    const items = await Item.find(query, safeItemFields).lean().exec()
    return items ? Right(items) : Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function createItem(
  input: ItemInput,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied, IItem>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'create:item')) return Left(accessDenied())
  if (!user.authoredTours.includes(new Types.ObjectId(input.tour))) {
    return Left(accessDenied())
  }

  try {
    const item = await Item.create(input)
    return Right(item)
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function patchItem(
  id: Types.ObjectId,
  input: ItemPatch,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied | NotFound, IItem>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'edit:item')) return Left(accessDenied())
  if (!user.authoredTours.includes(new Types.ObjectId(input.tour))) {
    return Left(accessDenied())
  }

  try {
    const item = await Item.findByIdAndUpdate(id, input)
    if (item) return Right(item)
    else return Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function deleteItem(
  id: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<Either<AccessDenied | NotFound | DBError, IItem>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) {
    const error = userResult.extract()
    return error.type === 'NotFound' ? Left(accessDenied()) : Left(error)
  }

  const itemResult = await _getById(id, Item)
  if (itemResult.isLeft()) return itemResult

  const user = userResult.unsafeCoerce()
  const item = itemResult.unsafeCoerce()

  if (!checkRole(user.role, 'delete:item') && item.itemAuthor.equals(userId))
    return Left(accessDenied())

  return Right(item)
}

export default {
  createItem,
  getItem,
  listItems,
  patchItem,
  deleteItem,
}
