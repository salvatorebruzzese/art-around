import mongoose, { Schema, Document, Types } from 'mongoose'
import { IGeoPosition } from '../shared/models.js'
import z from 'zod'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'

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
  itemAuthor: Types.ObjectId
  tour: Types.ObjectId
  explanations: IDescription[]
  license: string
  tags?: string[]
  image?: Types.ObjectId
  position?: IGeoPosition
  refs?: Types.ObjectId[]
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
    refs: [{ type: Schema.ObjectId, ref: 'Item' }],
    image: { type: Schema.ObjectId, ref: 'Asset' },
  },
  { collection: 'items', timestamps: true },
)

// NOTE: _id will always be returned (even if not specified)
export const safeItemFields: (keyof _Item)[] = [
  'name',
  'itemAuthor',
  'tour',
  'refs',
  'explanations',
  'license',
  'tags',
  'image',
  'position',
]

export const metaItemFields: (keyof _Item)[] = [
  'name',
  'itemAuthor',
  'tour',
  'license',
]
export const Item = mongoose.model<IItem>('Item', itemSchema)

// ---------------------
// DESCRIPTION VALIDATOR
// ---------------------

const DescriptionSchemaZod = z.object({
  level: z.string(),
  text: z.string(),
  durationSeconds: z.number().min(0),
})

export type Description = z.infer<typeof DescriptionSchemaZod>
export const Description = { validate: makeZodValidator(DescriptionSchemaZod) }

// --------------
// ITEM VALIDATOR
// --------------

const ItemInputSchemaZod = z.object({
  name: z.string(),
  itemAuthor: objectIdZod,
  tour: objectIdZod,
  explanations: z.array(DescriptionSchemaZod),
  license: z.string(),
  tags: z.array(z.string()).optional(),
  refs: objectIdZod.array().optional(),
  image: objectIdZod.optional(),
})

const ItemQuerySchemaZod = z.object({
  name: z.string().optional(),
  itemAuthor: objectIdZod.optional(),
  tour: objectIdZod.optional(),
  explanations: z.array(DescriptionSchemaZod).optional(),
  license: z.string().optional(),
  refs: objectIdZod.array().optional(),
  tags: z.array(z.string()).optional(),
  image: objectIdZod.optional(),
})

const ItemPatchSchemaZod = ItemInputSchemaZod.partial()

export type ItemInput = z.infer<typeof ItemInputSchemaZod>
export const ItemInput = { validate: makeZodValidator(ItemInputSchemaZod) }

export type ItemQuery = z.infer<typeof ItemQuerySchemaZod>
export const ItemQuery = { validate: makeZodValidator(ItemQuerySchemaZod) }

export type ItemPatch = z.infer<typeof ItemPatchSchemaZod>
export const ItemPatch = { validate: makeZodValidator(ItemPatchSchemaZod) }
