import {
  Asset,
  IAsset,
  AssetInput,
  AssetQuery,
  safeAssetFields,
  AssetPatch,
  metaAssetFields,
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
  ValidationError,
  validationError,
} from '../shared/errors.js'
import { User } from '../user/model.js'
import { Tour } from '../tour/model.js'
import { project } from '../shared/utils.js'

async function getAsset(
  id: Types.ObjectId,
  userID?: Types.ObjectId,
): Promise<Either<NotFound | DBError | AccessDenied, Partial<IAsset>>> {
  const assetResult = await _getById(id, Asset)
  if (assetResult.isRight()) {
    const asset = assetResult.unsafeCoerce()
    if (asset.public) return Right(asset)
    if (!userID) return Left(accessDenied())
    const userResult = await _getById(userID, User)
    if (userResult.isLeft()) return userResult
    const user = userResult.unsafeCoerce()
    if (!checkRole(user.role, 'view:asset')) return Left(accessDenied())
    if (asset.author.equals(userID)) return Right(asset)
    return !asset.tour || user.purchasedTours.includes(asset.tour)
      ? Right(project(safeAssetFields, asset))
      : Left(accessDenied())
  } else return assetResult
}

async function listAssets(
  query: AssetQuery,
): Promise<Either<NotFound | DBError, Partial<IAsset>[]>> {
  try {
    const assets = await Asset.find(query).lean().exec()
    return assets
      ? Right(assets.map((asset) => project(metaAssetFields, asset)))
      : Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function createAsset(
  input: AssetInput,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied | ValidationError, Partial<IAsset>>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()
  if (!checkRole(user.role, 'create:asset')) return Left(accessDenied())
  const tourId = new Types.ObjectId(input.tour)

  if (user.role != Role['Admin']) {
    if (!new Types.ObjectId(input.author).equals(userId))
      return Left(validationError('author', 'Logged user is not the author.'))
    if (!user.authoredTours.includes(tourId))
      return Left(validationError('tour', "Tour isn't authored."))
  }

  if ((await _getById(new Types.ObjectId(input.author), User)).isLeft())
    return Left(validationError('author', 'Autor not found.'))
  if ((await _getById(tourId, Tour)).isLeft())
    return Left(validationError('tour', 'Tour not found.'))

  try {
    const asset = await Asset.create(input)
    return Right(project(safeAssetFields, asset))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function patchAsset(
  id: Types.ObjectId,
  input: AssetPatch,
  userId: Types.ObjectId,
): Promise<Either<DBError | AccessDenied | NotFound, Partial<IAsset>>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) return Left(accessDenied())
  const user = userResult.unsafeCoerce()

  if (!checkRole(user.role, 'edit:asset')) return Left(accessDenied())
  if (user.role != Role['Admin']) {
    // Only allow editing if user is author
    const assetResult = await _getById(id, Asset)
    if (assetResult.isLeft()) return assetResult
    const asset = assetResult.unsafeCoerce()
    if (!asset.author.equals(userId)) return Left(accessDenied())
  }

  try {
    const asset = await Asset.findByIdAndUpdate(id, input, { new: true })
    if (asset) return Right(project(safeAssetFields, asset))
    else return Left(notFound())
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}

async function deleteAsset(
  id: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<Either<AccessDenied | NotFound | DBError, Partial<IAsset>>> {
  const userResult = await _getById(userId, User)
  if (userResult.isLeft()) {
    const error = userResult.extract()
    return error.type === 'NotFound' ? Left(accessDenied()) : Left(error)
  }

  const assetResult = await _getById(id, Asset)
  if (assetResult.isLeft()) return assetResult

  const user = userResult.unsafeCoerce()
  const asset = assetResult.unsafeCoerce()

  if (!checkRole(user.role, 'delete:asset')) return Left(accessDenied())
  if (user.role != Role['Admin'])
    if (!asset.author.equals(userId)) return Left(accessDenied())

  try {
    await asset.deleteOne()
    return Right(project(safeAssetFields, asset))
  } catch (e) {
    return Left(dbError(undefined, () => JSON.stringify(e)))
  }
}
export default {
  createAsset,
  getAsset,
  listAssets,
  patchAsset,
  deleteAsset,
}
