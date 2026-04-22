import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/', (_req: Request, res: Response) => {
  res.json([])
})

router.get('/:id', (_req: Request, res: Response) => {
  res.json({})
})

export default router
