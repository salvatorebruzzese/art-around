import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/:id', (_req: Request, res: Response) => {
  res.json({})
})

router.post('/', (_req: Request, res: Response) => {
  res.status(201).json({})
})

export default router
