import { Schema } from 'mongoose'
import z from 'zod'
import { makeZodValidator } from './validation.js'

/*
 * TODO: Dovremmo implementare qui libre/guided/master? (README.md)
 */
export type Role = 'Unauthenticated' | 'User' | 'Editor' | 'Admin'
export const sortedRoles: Role[] = [
  'Admin',
  'Editor',
  'User',
  'Unauthenticated',
]

export type NotFound = { type: 'NotFound' }
export type DBError = { type: 'DBError'; message: string; details?: string }
export type AccessDenied = { type: 'AccessDenied'; message: string }
export const EACCESS: AccessDenied = {
  type: 'AccessDenied',
  message: "You can't access this resource.",
}

/*
 * Permission: Action x Class
 */
export type Permission =
  | 'view:item'
  | 'view:museum'
  | 'view:tour'
  | 'view:metatour'
  | 'purchase:tour'
  | 'create:tour'
  | 'create:item'
  | 'edit:tour'
  | 'delete:tour'
  | 'manage:group'
  | 'sync:navigator'
  | 'assign:quiz'
  | 'view:users'
  | 'edit:all'

// Access Control Matrix: Role x Permission
export const ACMatrix: Record<Role, Permission[]> = {
  // TODO: fill theese
  Unauthenticated: ['view:museum', 'view:metatour'],
  User: [],
  Editor: [],
  Admin: [],
}

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
