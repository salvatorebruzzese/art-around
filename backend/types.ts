/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type  */
import { PublicUser } from './models.js'

declare global {
  namespace Express {
    interface User extends PublicUser {}
  }
}
