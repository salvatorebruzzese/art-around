import { Item, IItem } from './model.js'
import { Either, Left, Right } from 'purify-ts/Either'
import { Types } from 'mongoose'
import { z } from 'zod'
import { makeZodValidator } from '../shared/validation.js'
import { sortedRoles } from '../shared/models.js'
import { _getById, filterRoles } from '../shared/utils.js'
import {
  accessDenied,
  AccessDenied,
  dbError,
  DBError,
  NotFound,
} from '../shared/errors.js'
import { User } from '../user/model.js'
import { Tour } from './model.js'

// ==================
//      Schemas
// ==================

// Arrays because the name can be a sentence
// and the tour could have multiple authors
const TourQuerySchema = z.object({
  name: z.union([z.string(), z.array(z.string())]).optional(),
  author: z.array(z.string()).optional(),
})

export type TourQuery = z.infer<typeof TourQuerySchema>
export const TourQuery = {
  validate: makeZodValidator(TourQuerySchema),
}

const TourInputSchema = z.object({
  name: z.union([z.string(), z.array(z.string())]),
  author: z.array(z.string()),
})

export type TourInput = z.infer<typeof TourInputSchema>
export const TourInput = {
  validate: makeZodValidator(TourInputSchema),
}
