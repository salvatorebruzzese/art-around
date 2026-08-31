import mongoose, { Schema, Document, Types } from 'mongoose'
import z from 'zod'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'

export interface IAsset extends Document {
  author: Types.ObjectId
  tour?: Types.ObjectId
  data: Buffer
  datatype: string
  public?: boolean
  miniature?: Types.ObjectId
}

export const assetSchema = new Schema<IAsset>(
  {
    author: { type: Schema.ObjectId, ref: 'User', required: true },
    tour: { type: Schema.ObjectId, ref: 'Tour' },
    data: { type: Buffer, required: true },
    datatype: { type: String, required: true },
    public: { type: Boolean },
    miniature: { type: Schema.ObjectId, ref: 'Asset' },
  },
  { timestamps: true },
)

export const Asset = mongoose.model<IAsset>('Asset', assetSchema)

export const safeAssetFields: (keyof IAsset)[] = [
  'author',
  'tour',
  'datatype',
  'data',
  'miniature',
]

// -----------
// ASSET VALIDATOR
// -----------

const AssetInputSchemaZod = z.object({
  author: objectIdZod,
  tour: objectIdZod,
  data: z.any(), // or z.instanceof(Buffer)
  datatype: z.string(),
  public: z.preprocess((v) => v === 'true', z.boolean().optional()),
  miniature: objectIdZod.optional(),
})

const AssetQuerySchemaZod = z.object({
  author: objectIdZod.optional(),
  tour: objectIdZod.optional(),
  datatype: z.string().optional(),
  public: z.boolean().optional(),
  miniature: objectIdZod.optional(),
})

const AssetPatchSchemaZod = AssetInputSchemaZod.partial()

export type AssetInput = z.infer<typeof AssetInputSchemaZod>
export const AssetInput = { validate: makeZodValidator(AssetInputSchemaZod) }

export type AssetQuery = z.infer<typeof AssetQuerySchemaZod>
export const AssetQuery = { validate: makeZodValidator(AssetQuerySchemaZod) }

export type AssetPatch = z.infer<typeof AssetPatchSchemaZod>
export const AssetPatch = { validate: makeZodValidator(AssetPatchSchemaZod) }
