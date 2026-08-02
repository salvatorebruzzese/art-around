import { Tour, ITour } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'
import { sortedRoles } from '../shared/models.js'
import { _getById, filterRoles } from '../shared/utils.js'
import { dbError, DBError } from '../shared/errors.js'
import { ObjectId } from 'mongoose'

// Returns an array of tours
async function getTour(query: TourQuery): Promise<Either<DBError, ITour[]>> {
  try {
    const result = await Tour.find(query, 'name author').lean().exec()
    return Right(result)
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// TODO: add role checks for user and editors
async function makeTour(input: TourInput): Promise<Either<DBError, ITour>> {
  try {
    const result = await Tour.create(input)
    return Right(result)
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

export default { getTour, makeTour, updateTour }
