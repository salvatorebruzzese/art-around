import mongoose, { Schema, Document, Types } from 'mongoose'
import z from 'zod'
import { makeZodValidator, objectIdZod } from '../shared/validation.js'
import { Projection } from '../shared/utils.js'

export interface IAsset extends Document {
  author: Types.ObjectId
  tour?: Types.ObjectId
  data: Buffer
  datatype: string
  public?: boolean
}

export const assetSchema = new Schema<IAsset>(
  {
    author: { type: Schema.ObjectId, ref: 'User', required: true },
    tour: { type: Schema.ObjectId, ref: 'Tour' },
    data: { type: Buffer, required: true },
    datatype: { type: String, required: true },
    public: { type: Boolean },
  },
  { timestamps: true },
)

export const Asset = mongoose.model<IAsset>('Asset', assetSchema)

export const safeAssetFields: Projection<IAsset> = {
  author: 1,
  tour: 1,
  datatype: 1,
  data: 1,
}

// -----------
// ASSET VALIDATOR
// -----------

const AssetInputSchemaZod = z.object({
  author: objectIdZod,
  tour: objectIdZod,
  data: z.any(), // or z.instanceof(Buffer)
  datatype: z.string(),
  public: z.boolean().optional(),
})

const AssetQuerySchemaZod = z.object({
  author: objectIdZod.optional(),
  tour: objectIdZod.optional(),
  datatype: z.string().optional(),
  public: z.boolean().optional(),
})

const AssetPatchSchemaZod = AssetInputSchemaZod.partial()

export type AssetInput = z.infer<typeof AssetInputSchemaZod>
export const AssetInput = { validate: makeZodValidator(AssetInputSchemaZod) }

export type AssetQuery = z.infer<typeof AssetQuerySchemaZod>
export const AssetQuery = { validate: makeZodValidator(AssetQuerySchemaZod) }

export type AssetPatch = z.infer<typeof AssetPatchSchemaZod>
export const AssetPatch = { validate: makeZodValidator(AssetPatchSchemaZod) }
