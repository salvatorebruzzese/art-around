/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type  */
import { PublicUser } from '../user-model.js'

declare global {
  namespace Express {
    interface User extends PublicUser {}
  }
}
