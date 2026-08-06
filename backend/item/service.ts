import { Item, IItem, ItemQuery, ItemInput, safeItemFields } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import { sortedRoles } from '../shared/models.js'
import { _getById, filterRoles } from '../shared/utils.js'
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
  // RBAC
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()
  const roles = user.roles || ['Unauthenticated']
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

/* eslint-disable @typescript-eslint/no-unused-vars */
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

  const roles = user.roles ?? ['Unauthenticated']
  const froles = filterRoles(roles, 'create:item')
  if (froles.length === 0) return Left(accessDenied())

  const permitted = sortedRoles
    .filter((role) => froles.includes(role))
    .some((role) => {
      if (role === 'Editor') return item.itemAuthor.equals(userId)
      return true
    })

  if (!permitted) return Left(accessDenied())
  return Right(item)
}

export default {
  createItem,
  getItem,
  listItems,
}
