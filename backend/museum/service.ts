import { Museum, IMuseum, MuseumQuery } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import { NotFound, DBError, dbError, notFound } from '../shared/errors.js'

async function getMuseum(
  id: Types.ObjectId,
): Promise<Either<NotFound | DBError, IMuseum>> {
  // NOTE: We don't need to check for ownership
  // over museums data, as it's public data

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
  query: MuseumQuery,
): Promise<Either<DBError, IMuseum[]>> {
  try {
    const items = await Museum.find(query, 'name').lean().exec()
    return Right(items)
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// async function createMuseum(
//   input: MuseumInput,
// ): Promise<Either<DBError, IMuseum>> {
//   try {
//     const item = await Museum.create(input)
//     return Right(item)
//   } catch (e) {
//     return Left(dbError(undefined, () => String(e)))
//   }
// }

export default {
  // createMuseum,
  getMuseum,
  listMuseums,
}
