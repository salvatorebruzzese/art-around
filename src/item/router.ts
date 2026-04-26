import express, { Request, Response } from 'express'
import ItemService, { ItemInput, ItemQuery } from './service.js'
import mongoose from 'mongoose'
import { assertNever } from '../shared/utils.js'
import { EitherAsync } from 'purify-ts'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  return await EitherAsync.liftEither(ItemQuery.validate(req.query))
    .chain(ItemService.listItems)
    .run()
    .then((either) =>
      either.caseOf({
        Right: (itemList) => res.json(itemList),
        Left: (e) => {
          switch (e.type) {
            case 'DBError':
              break
            case 'ValidationError':
              break
            default:
              assertNever(e)
          }
        },
      }),
    )
})

router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Malformed ID' })
  }
  const id = mongoose.Types.ObjectId.createFromHexString(req.params.id)
  const result = await ItemService.getItem(id)
  result.caseOf({
    Right: (value) => {
      return res.json(value)
    },
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
  return await EitherAsync.liftEither(ItemInput.validate(req.body))
    .chain(ItemService.createItem)
    .run() // promise
    .then((either) =>
      either.caseOf({
        Right: (item) => res.status(201).json(item),
        Left: (error) => {
          switch (error.type) {
            case 'ValidationError':
              res.status(400).json({ error: error })
              break
            case 'DBError':
              res.status(500).json({ error: error })
              break
            default:
              assertNever(error)
          }
        },
      }),
    )
})

router.patch('/:id', (_req: Request, res: Response) => {
  res.json({})
})

export default router
