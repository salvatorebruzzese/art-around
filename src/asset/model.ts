import mongoose, { Schema, Document } from 'mongoose'
import z from 'zod'

export interface IAsset extends Document {
  data: Buffer
  datatype: string
}

export const assetSchema = new Schema<IAsset>(
  {
    data: { type: Buffer, required: true },
    datatype: { type: String, required: true },
  },
  { timestamps: true },
)

export const Asset = mongoose.model<IAsset>('Asset', assetSchema)

// -----------
// ASSET VALIDATOR
// -----------

const AssetInputSchemaZod = z.object({
  data: z.any(), // Buffer
  datatype: z.string(),
})

export type AssetInput = z.infer<typeof AssetInputSchemaZod>
export const AssetInput = { validate: makeZodValidator(AssetInputSchemaZod) }
