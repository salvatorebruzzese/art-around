import express, { Request, Response } from 'express'
import ItemService, { DBError, ItemInput, ItemQuery } from './service.js'
import mongoose from 'mongoose'
import { assertNever } from '../shared/utils.js'
import { Either } from 'purify-ts'
import { IItem } from './model.js'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  // Explicit validation
  const validation = ItemQuery.validate(req.query)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const query = validation.unsafeCoerce()
  const result: Either<DBError, IItem[]> = await ItemService.listItems(query)
  result.caseOf({
    Right: (itemList) => res.json(itemList),
    Left: (e) => {
      switch (e.type) {
        case 'DBError':
          return res.status(500).json({ error: e })
      }
    },
  })
})

router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Malformed ID' })
  }
  const id = mongoose.Types.ObjectId.createFromHexString(req.params.id)
  const result = await ItemService.getItem(id)
  result.caseOf({
    Right: (value) => res.json(value),
    Left: (err) => {
      switch (err.type) {
        case 'DBError':
          return res.status(500).json({ error: err })
        case 'NotFound':
          return res.status(404).json({ error: err })
        default:
          assertNever(err)
      }
    },
  })
})

router.post('/', async (req: Request, res: Response) => {
  // Explicit validation
  const validation = ItemInput.validate(req.body)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const input = validation.unsafeCoerce()
  const result = await ItemService.createItem(input)
  result.caseOf({
    Right: (item) => res.status(201).json(item),
    Left: (error) => {
      switch (error.type) {
        case 'DBError':
          return res.status(500).json({ error })
      }
    },
  })
})

router.patch('/:id', (_req: Request, res: Response) => {
  res.json({})
})

export default router
