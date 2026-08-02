import { Museum, IMuseum } from './model.js'
import { IUser } from '../user/model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import mongoose, { Types } from 'mongoose'
import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'
import { sortedRoles, NotFound,DBError, AccessDenied, EACCESS } from '../shared/models.js'
import { filterRoles } from '../shared/utils.js'

async function getMuseum(
  id: Types.ObjectId,
  user?:IUser,
): Promise<Either<NotFound | DBError | AccessDenied, IMuseum>> {
  // NOTE: We don't need to check for ownership
  // over museums data, as it's public data

  try {
    const museum = await Museum.findById(id).lean().exec()
    if (museum) {
      return Right(museum)
    } else {
      return Left({type: 'NotFound' as const})
    }
  } catch (e) {
    return Left({
      type: 'DBError',
      message: 'An error occurred with the database.',
      details: process.env.DEBUG ? String(e) : undefined,
    })
  }
}

async function listMuseums(query: MuseumQuery): Promise<Either<DBError, IMuseum[]>> {
  try {
    const items = await Museum.find(query, 'name').lean().exec()
    return Right(items)
  }
  catch (e) {
    return Left({
      type: 'DBError',
      message: 'An error occurred with the database.',
      details: process.env.DEBUG ? String(e) : undefined,
    })
  }
}

// ==================
//      Schemas
// ==================

// Really stripped down schema
// Do we really need more to query museums?
const MuseumQuerySchema = z.object({
  name: z.string().optional()
})

export type MuseumQuery = z.infer<typeof MuseumQuerySchema>
export const MuseumQuery = {
  validate: makeZodValidator(MuseumQuerySchema)
}

export default {
  getMuseum,
  listMuseums
}