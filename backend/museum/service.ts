import { Museum, IMuseum, MuseumQuery } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import {
  DBError,
  dbError,
  NotFound,
  notFound,
  ValidationError,
} from '../shared/errors.js'

async function getMuseum(
  id: Types.ObjectId,
): Promise<Either<NotFound | DBError, IMuseum>> {
  try {
    const museum = await Museum.findById(id).lean().exec()
    if (museum) {
      return Right(museum)
    } else {
      return Left(notFound())
    }
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function listMuseums(
  rawQuery: unknown,
): Promise<Either<ValidationError | DBError, Partial<IMuseum>[]>> {
  const validation = MuseumQuery.validate(rawQuery)
  if (validation.isLeft()) return validation

  const query = validation.unsafeCoerce()

  try {
    const filter: Record<string, unknown> = { ...query }
    if (filter.name) {
      filter.name = { $regex: filter.name, $options: 'i' }
    }

    const items = await Museum.find(filter).lean().exec()
    return Right(items)
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

export default {
  getMuseum,
  listMuseums,
}
