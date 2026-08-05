import { Item, IItem, ItemQuery, ItemInput } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import { sortedRoles } from '../shared/models.js'
import { _getById, filterRoles } from '../shared/utils.js'
import {
  accessDenied,
  AccessDenied,
  dbError,
  DBError,
  NotFound,
} from '../shared/errors.js'
import { User } from '../user/model.js'

async function getItem(
  id: Types.ObjectId,
  userID: Types.ObjectId,
): Promise<Either<NotFound | DBError | AccessDenied, IItem>> {
  // 1. Check role
  //    a. User -> Check if item is part of purchased tours
  //    b. Editor -> Check if item is part of authored tours
  //    d. _ -> granted (by ACMatrix)
  // _ -> Denied

  const userResult = await _getById(userID, User)
  if (userResult.isLeft()) return userResult
  const user = userResult.unsafeCoerce()
  const roles = user?.roles || ['Unauthenticated']
  const froles = filterRoles(roles, 'view:item') // filtered roles
  if (froles.length == 0) return Left(accessDenied())

  if (
    !sortedRoles
      .filter((item) => froles.includes(item))
      .some((role) => {
        switch (role) {
          case 'User':
            return user!.purchasedTours.includes(id)
          case 'Editor':
            return user!.authoredTours.includes(id)
          default:
            return true
        }
      })
  ) {
    return Left(accessDenied())
  }

  return _getById(id, Item)
}

async function listItems(query: ItemQuery): Promise<Either<DBError, IItem[]>> {
  try {
    const items = await Item.find(query, 'name tags').lean().exec()
    return Right(items)
  } catch (e) {
    return Left({ type: 'DBError', message: String(e) }) // TODO: use dbError
  }
}

async function createItem(
  input: ItemInput,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied, IItem>> {
  // RBAC
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()
  const roles = user?.roles || ['Unauthenticated']
  const froles = filterRoles(roles, 'create:item') // filtered roles
  if (froles.length == 0) return Left(accessDenied())
  if (
    !sortedRoles
      .filter((item) => froles.includes(item))
      .some((role) => {
        switch (role) {
          case 'Editor':
            return user!.authoredTours.includes(new Types.ObjectId(input.tour))
          default:
            return true
        }
      })
  ) {
    return Left(accessDenied())
  }

  try {
    const item = await Item.create(input) // It's actually easy
    return Right(item)
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

export default {
  createItem,
  getItem,
  listItems,
}
