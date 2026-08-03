import mongoose, { Schema, Document } from 'mongoose'

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
