import mongoose, { Schema, Document, Types } from 'mongoose'
import { IGeoPosition } from '../shared/models.js'
import z from 'zod'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'
import { Projection } from '../shared/utils.js'

export interface IDescription {
  level: 'simple' | 'normal' | 'advanced'
  text: string
  durationSeconds: number // Natural number
}

export const DescriptionSchema = new Schema<IDescription>(
  {
    level: {
      type: String,
      enum: ['simple', 'normal', 'advanced'],
      required: true,
    },
    text: { type: String, required: true },
    durationSeconds: {
      type: Number,
      required: true,
      min: [0, 'Duration must be a natural number'],
      validate: {
        validator: Number.isInteger,
        message: 'Duration must be an integer',
      },
    },
  },
  { _id: false },
)
export enum ItemType {
  Artist = 'artist',
  Style = 'style',
  Technique = 'technique',
  Artwork = 'artwork',
  Other = 'other',
}

interface _Item {
  name: string
  itemType: ItemType
  itemAuthor: Types.ObjectId
  tour: Types.ObjectId
  explanations: IDescription[]
  license: string
  tags?: string[]
  images?: Types.ObjectId[]
  position?: IGeoPosition
}

export interface IItem extends Document, _Item {}

export const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    itemAuthor: { type: Schema.ObjectId, ref: 'User', required: true },
    explanations: {
      type: [DescriptionSchema],
      required: true,
      validate: [
        (v: IDescription[]) => v.length > 0,
        'Must have at least one explanation',
      ],
    },
    license: String,
    tour: { type: Schema.ObjectId, ref: 'Tour', required: true },
    tags: [{ type: String }],
    images: [{ type: Schema.ObjectId, ref: 'Asset' }],
  },
  { discriminatorKey: 'itemType', collection: 'items', timestamps: true },
)

// NOTE: _id will always be returned (even if not specified)
export const safeItemFields: Projection<_Item> = {
  name: 1,
  itemType: 1,
  itemAuthor: 1,
  tour: 1,
  explanations: 1,
  license: 1,
}

export const Item = mongoose.model<IItem>('Item', itemSchema)

// ---------------------
// DESCRIPTION VALIDATOR
// ---------------------

const levels = ['simple', 'normal', 'advanced']

const DescriptionSchemaZod = z.object({
  level: z.string().refine((str) => levels.includes(str), {
    error: 'Level must be either normal, simple or advanced',
  }),
  text: z.string(),
  duration: z.number().min(0),
})

export type Description = z.infer<typeof DescriptionSchemaZod>
export const Description = { validate: makeZodValidator(DescriptionSchemaZod) }

// --------------
// ITEM VALIDATOR
// --------------

const ItemInputSchemaZod = z.object({
  name: z.string(),
  itemType: z.enum(ItemType),
  itemAuthor: objectIdZod,
  tour: objectIdZod,
  explanations: z.array(DescriptionSchemaZod),
  license: z.string(),
  tags: z.array(z.string()).optional(),
  images: z.array(objectIdZod).optional(),
})

const ItemQuerySchemaZod = z.object({
  name: z.string().optional(),
  itemType: z.enum(ItemType).optional(),
  itemAuthor: objectIdZod.optional(),
  tour: objectIdZod.optional(),
  explanations: z.array(DescriptionSchemaZod).optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(objectIdZod).optional(),
})

const ItemPatchSchemaZod = ItemInputSchemaZod.partial()

export type ItemInput = z.infer<typeof ItemInputSchemaZod>
export const ItemInput = { validate: makeZodValidator(ItemInputSchemaZod) }

export type ItemQuery = z.infer<typeof ItemQuerySchemaZod>
export const ItemQuery = { validate: makeZodValidator(ItemQuerySchemaZod) }

export type ItemPatch = z.infer<typeof ItemPatchSchemaZod>
export const ItemPatch = { validate: makeZodValidator(ItemPatchSchemaZod) }
