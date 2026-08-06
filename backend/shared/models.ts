import { Schema } from 'mongoose'
import z from 'zod'
import { makeZodValidator } from './validation.js'

export interface IGeoPosition {
  type: 'Point'
  coordinates: [number, number]
}

export const geoPositionSchema = new Schema<IGeoPosition>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v: number[]) {
          return v.length === 2
        },
        message:
          'Coordinates must be an array of two numbers [longitude, latitude]',
      },
    },
  },
  { _id: false },
)

const PositionSchemaZod = z.object({
  coordinates: z.array(z.number()).length(2),
})

export type Position = z.infer<typeof PositionSchemaZod>
export const Position = { validate: makeZodValidator(PositionSchemaZod) }
