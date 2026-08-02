import { PublicUser } from '../user/model.js'

declare module 'express' {
  type User = PublicUser
}
