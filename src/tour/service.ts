import { Tour, ITour } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'
import {
  AccessDenied,
  NotFound,
  sortedRoles,
  tourPriceSchema,
} from '../shared/models.js'
import { _getById, filterRoles } from '../shared/utils.js'
import { dbError, DBError, notFound } from '../shared/errors.js'
import { Types, ObjectId } from 'mongoose'

const projection: string = 'name author price'

async function getTour(
  id: Types.ObjectId,
): Promise<Either<DBError | NotFound, [ITour, Types.ObjectId]>> {
  try {
    const result = await Tour.findById(id, projection).lean().exec()

    if (result === null) return Left(notFound())

    return Right([result, result._id])
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function listTour(query: TourQuery): Promise<Either<DBError, ITour[]>> {
  try {
    const result = await Tour.find(query, projection).lean().exec()
    return Right(result)
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// TODO: add role checks for user and editors
async function makeTour(
  input: TourInput,
): Promise<Either<AccessDenied | DBError, [ITour, Types.ObjectId]>> {
  try {
    const result = await Tour.create(input)
    return Right([result, result._id])
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

async function updateTour(
  id: ObjectId,
  input: TourInput,
): Promise<Either<DBError, ITour | null>> {
  try {
    const result = await Tour.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true },
    )

    return Right(result)
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// ==================
//      Schemas
// ==================

// Arrays because the name can be a sentence
// and the tour could have multiple authors
const TourQuerySchema = z.object({
  name: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (Array.isArray(val) ? [val] : val)),
  author: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (Array.isArray(val) ? [val] : val)),
  price: tourPriceSchema,
})

export type TourQuery = z.infer<typeof TourQuerySchema>
export const TourQuery = {
  validate: makeZodValidator(TourQuerySchema),
}

const TourInputSchema = z.object({
  name: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? [val] : val)),
  author: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? [val] : val)),
})

export type TourInput = z.infer<typeof TourInputSchema>
export const TourInput = {
  validate: makeZodValidator(TourInputSchema),
}

export default { getTour, listTour, makeTour, updateTour }
