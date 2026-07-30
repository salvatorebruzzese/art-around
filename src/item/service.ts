import { Item, IItem } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import mongoose, { Types } from 'mongoose'
import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'

export type NotFound = { type: 'NotFound' }
export type DBError = { type: 'DBError'; message: string }

async function getItem(
  id: Types.ObjectId,
): Promise<Either<NotFound | DBError, IItem>> {
  try {
    const item = await Item.findById(id).lean().exec()
    if (item) {
      return Right(item)
    } else {
      return Left({ type: 'NotFound' as const })
    }
  } catch (e) {
    return Left({ type: 'DBError', message: String(e) })
  }
}

async function listItems(query: ItemQuery): Promise<Either<DBError, IItem[]>> {
  try {
    const items = await Item.find(query, 'name tags').lean().exec()
    return Right(items)
  } catch (e) {
    return Left({ type: 'DBError', message: String(e) })
  }
}

async function createItem(input: ItemInput): Promise<Either<DBError, IItem>> {
  try {
    const item = await Item.create(input)
    return Right(item)
  } catch (e) {
    return Left({ type: 'DBError', message: String(e) })
  }
}

// ==================
//      Schemas
// ==================

const ItemQuerySchema = z.object({
  name: z.string().optional(),
  // Accetta sia un array di stringhe che una singola stringa
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (typeof val === 'string' ? [val] : val)), // gestisce ?tags=foo or ?tags=foo&tags=bar
  tour: z
    .string()
    .optional()
    .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
      message: 'tour must be a valid ObjectId string',
    }),
  museum: z
    .string()
    .optional()
    .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
      message: 'museum must be a valid ObjectId string',
    }),
})

export type ItemQuery = z.infer<typeof ItemQuerySchema>
export const ItemQuery = {
  validate: makeZodValidator(ItemQuerySchema),
}

const ItemInputSchema = ItemQuerySchema.extend({
  name: z.string(),
})

export type ItemInput = z.infer<typeof ItemInputSchema>
export const ItemInput = {
  validate: makeZodValidator(ItemInputSchema),
}

export default {
  createItem,
  getItem,
  listItems,
}
