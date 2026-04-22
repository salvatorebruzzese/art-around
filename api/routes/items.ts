import express, { Request, Response } from 'express'
import { Item, IItem } from '../models/index.js'

const router = express.Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await Item.find({}, 'name tags').lean()
    const result = items.map((item: IItem) => ({
      id: item._id,
      name: item.name,
      tags: item.tags,
    }))
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({
      error: 'Could not fetch items',
      details: err instanceof Error ? err.message : String(err),
    })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('images')
      .populate('tour')
      .lean()
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json(item)
  } catch (err: unknown) {
    res.status(500).json({
      error: 'Could not fetch items',
      details: err instanceof Error ? err.message : String(err),
    })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, tags, tour, images, description } = req.body as {
      name: string
      tags?: string[]
      tour?: string
      images?: string[]
      description?: string
    }
    if (!name) return res.status(400).json({ error: 'Name is required' })
    const item = await Item.create({ name, tags, tour, images, description })
    res.status(201).json(item)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Could not create item', details: message })
  }
})

router.patch('/:id', (_req: Request, res: Response) => {
  res.json({})
})

export default router
