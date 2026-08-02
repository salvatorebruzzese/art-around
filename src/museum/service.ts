import { Museum, IMuseum } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import mongoose, { Types } from 'mongoose'
import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'
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

async function createMuseum(
  input: MuseumInput,
): Promise<Either<DBError, IMuseum>> {
  try {
    const item = await Museum.create(input)
    return Right(item)
  } catch (e) {
    return Left(dbError(undefined, () => String(e)))
  }
}

// ==================
//      Schemas
// ==================

// Really stripped down schema
// Do we really need more to query museums?
const MuseumQuerySchema = z.object({
  name: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (Array.isArray(val) ? [val] : val)),
})

export type MuseumQuery = z.infer<typeof MuseumQuerySchema>
export const MuseumQuery = {
  validate: makeZodValidator(MuseumQuerySchema),
}

const MuseumInputSchema = z.object({
  name: z.string(),
  thumbnail: z
    .string()
    .optional()
    .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
      message: 'thumbnail must be a valid ObjectId',
    }),
  description: z.string().optional(),
  address: z.string().optional(),
})

export type MuseumInput = z.infer<typeof MuseumInputSchema>
export const MuseumInput = {
  validate: makeZodValidator(MuseumInputSchema),
}

export default {
  createMuseum,
  getMuseum,
  listMuseums,
}
