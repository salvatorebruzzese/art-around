import express, { Request, Response } from 'express'
import ItemService, { ItemInput } from './service.js'

const router = express.Router()

router.get('/', async (_req: Request, res: Response) => {
  const result = await ItemService.listItems()

  result.match(
    (items) => res.json(items),
    (error) => {
      switch (error.type) {
        case 'DBError':
          return res
            .status(500)
            .json({ error: 'Could not fetch items', details: error.details })
      }
    },
  )
})

router.get('/:id', async (req, res) => {
  const result = await ItemService.getItem(req.params.id)

  result.match(
    (item) => res.json(item), // success: 200 OK

    (error) => {
      switch (error.type) {
        case 'NotFound':
          return res.status(404).json({ error: 'Item not found' })
        case 'DBError':
          return res
            .status(500)
            .json({ error: 'Database error', details: error.details })
        // (add other error types here)
      }
    },
  )
})

router.post('/', async (req: Request, res: Response) => {
  const { name, tags, tour, images, description } = req.body as ItemInput

  const result = await ItemService.createItem({
    name,
    tags,
    tour,
    images,
    description,
  })

  result.match(
    (item) => res.status(201).json(item),
    (error) => {
      switch (error.type) {
        case 'ValidationError':
          return res.status(400).json({ error: error.message })
        case 'DBError':
          return res
            .status(500)
            .json({ error: 'Could not create item', details: error.details })
      }
    },
  )
})

router.patch('/:id', (_req: Request, res: Response) => {
  res.json({})
})

export default router
