import express, { Request, Response } from 'express'
import { NotFound, DBError } from '../shared/models.js'
import { IMuseum } from './model.js'
import MuseumService, { MuseumQuery } from './service.js'
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
          return res.status(404).json({ error: 'Museum not found' })
      }
    },
  })
})

router.get('/:id', async (req: Request, res: Response) => {
  const museumID = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id
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
