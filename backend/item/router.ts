import express, { Request, Response } from 'express'
import { ItemInput, ItemPatch, ItemQuery } from './model.js'
import ItemService from './service.js'
import mongoose, { Types } from 'mongoose'
import { ensureAuth } from '../accessControl.js'
import { handleLeft } from '../shared/router.js'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  // Explicit validation
  const validation = ItemQuery.validate(req.query)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const query = validation.unsafeCoerce()
  const result = await ItemService.listItems(query)
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

router.get('/:id', ensureAuth, async (req, res) => {
  const itemID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(itemID))
    return res.status(400).json({ message: 'Malformed item ID' })

  const id = new Types.ObjectId(itemID)
  const result = await ItemService.getItem(id, userID)
  result.caseOf({
    Right: (value) => res.json(value),
    Left: handleLeft(res),
  })
})

router.post('/', ensureAuth, async (req: Request, res: Response) => {
  // Explicit validation
  const validation = ItemInput.validate(req.body)
  if (validation.isLeft())
    return res.status(400).json({ error: validation.extract() })
  const input = validation.unsafeCoerce()
  const result = await ItemService.createItem(input, req.user!._id)
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

router.patch('/:id', ensureAuth, async (req: Request, res: Response) => {
  const itemID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(itemID))
    return res.status(400).json({ message: 'Malformed item ID' })

  const id = new Types.ObjectId(itemID)

  // Validate input
  const validation = ItemPatch.validate(req.body)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }
  const input = validation.unsafeCoerce()

  const result = await ItemService.patchItem(id, input, userID)
  result.caseOf({
    Right: (item) => res.json(item),
    Left: handleLeft(res),
  })
})

router.delete('/:id', ensureAuth, async (req: Request, res: Response) => {
  const itemID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(itemID))
    return res.status(400).json({ message: 'Malformed item ID' })

  const id = new Types.ObjectId(itemID)
  const result = await ItemService.deleteItem(id, userID)
  result.caseOf({
    Right: (item) => res.json(item),
    Left: handleLeft(res),
  })
})
export default router
