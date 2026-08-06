import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/', (_req: Request, res: Response) => {
  res.json([])
})

router.post('/', (_req: Request, res: Response) => {
  res.status(201).json({})
})

router.patch('/:id', (_req: Request, res: Response) => {
  res.json({})
})

export default router
