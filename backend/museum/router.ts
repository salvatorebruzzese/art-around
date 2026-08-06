import express, { Request, Response } from 'express'
import { NotFound, DBError } from '../shared/errors.js'
import { IMuseum, MuseumQuery } from './model.js'
import MuseumService from './service.js'
import { Either } from 'purify-ts'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  const validation = MuseumQuery.validate(req.query)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const query = validation.unsafeCoerce()
  const result: Either<DBError | NotFound, IMuseum[]> =
    await MuseumService.listMuseums(query)
  result.caseOf({
    Right: (museumList) => res.json(museumList),
    Left: (e) => {
      switch (e.type) {
        case 'DBError':
          return res.status(500).json({ error: e })
        case 'NotFound':
          return res.status(404).json({ error: e })
      }
    },
  })
})

router.get('/:id', async (req: Request, res: Response) => {
  // For now we'll avoid filters
  const validation = MuseumQuery.validate(req.params)

  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const raw = validation.extract()

  const museumID = Array.isArray(raw) ? raw[0] : raw

  if (!mongoose.Types.ObjectId.isValid(museumID))
    return res.status(400).json({ message: 'Malformed museum ID' })

  const id = mongoose.Types.ObjectId.createFromHexString(museumID)
  const result = await MuseumService.getMuseum(id)
  result.caseOf({
    Right: (value) => res.json(value),
    Left: (err) => {
      switch (err.type) {
        case 'DBError':
          return res.status(500).json({ error: err })
        case 'NotFound':
          return res.status(404).json({ error: err })
      }
    },
  })
})

export default router
