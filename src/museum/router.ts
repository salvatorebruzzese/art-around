import express, { Request, Response } from 'express'
import {
  sortedRoles,
  NotFound,
  DBError,
  AccessDenied,
  EACCESS,
} from '../shared/models.js'
import { IMuseum } from './model.js'
const router = express.Router()

router.get('/', (_req: Request, res: Response) => {
  res.json([])
})

router.get('/:id', (_req: Request, res: Response) => {
  res.json({})
})

export default router
