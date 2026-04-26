import { Item, IItem } from './model.js'
import { Left, Right } from 'purify-ts/Either'
import mongoose, { Types } from 'mongoose'
import { z } from 'zod'
import { EitherAsync } from 'purify-ts'
import { makeZodValidator } from '../shared/validation.js'

export type NotFound = { type: 'NotFound' }
export type DBError = { type: 'DBError'; message: string }

function getItem(id: Types.ObjectId): EitherAsync<NotFound | DBError, IItem> {
  return EitherAsync(({ fromPromise }) =>
    fromPromise(
      Item.findById(id)
        .lean()
        .exec()
        .then((item) =>
          item ? Right(item) : Left({ type: 'NotFound' as const }),
        )
        .catch((e) => Left({ type: 'DBError', message: String(e) })),
    ),
  )
}

function listItems(query: ItemQuery): EitherAsync<DBError, IItem[]> {
  return EitherAsync(({ fromPromise }) =>
    fromPromise(
      Item.find(query, 'name tags')
        .lean()
        .exec()
        .then((items) => Right(items))
        .catch((e) => Left({ type: 'DBError', message: String(e) })),
    ),
  )
}

function createItem(input: ItemInput): EitherAsync<DBError, IItem> {
  return EitherAsync(({ fromPromise }) =>
    fromPromise(
      Item.create(input)
        .then((item) => Right(item))
        .catch((e) => Left({ type: 'DBError', message: String(e) })),
    ),
  )
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
