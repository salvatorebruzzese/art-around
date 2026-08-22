import { Response } from 'express'
import { DBError, NotFound, AccessDenied, ValidationError } from './errors.js'
import { assertNever } from './utils.js'

type KnownError = DBError | NotFound | AccessDenied | ValidationError

export function handleLeft(res: Response) {
  return (error: KnownError) => {
    console.log(error)
    switch (error.type) {
      case 'DBError':
        return res.status(500).json({ error })
      case 'NotFound':
        return res.status(404).json({ error })
      case 'AccessDenied':
        return res.status(403).json({ error })
      case 'ValidationError':
        return res.status(400).json({ error })
      default:
        assertNever(error)
    }
  }
}
