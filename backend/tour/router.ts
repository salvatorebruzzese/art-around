import express, { Request, Response } from 'express'
import { TourInput, TourPatch, TourQuery } from './model.js'
import TourService from './service.js'
import mongoose, { Types } from 'mongoose'
import { ensureAuth } from '../accessControl.js'
import { handleLeft } from '../shared/router.js'
import { accessDenied } from '../shared/errors.js'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  const validation = TourQuery.validate(req.query)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const query = validation.unsafeCoerce()
  const result = await TourService.listTours(query)
  result.caseOf({
    Right: (tourList) => res.json(tourList),
    Left: (e) => {
      switch (e.type) {
        case 'DBError':
          return res.status(500).json({ error: e })
      }
    },
  })
})

router.get('/:id', ensureAuth, async (req, res) => {
  const tourID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(tourID))
    return res.status(400).json({ message: 'Malformed tour ID' })

  const id = new Types.ObjectId(tourID)
  const result = await TourService.getTour(id, userID)
  result.caseOf({
    Right: (value) => res.json(value),
    Left: handleLeft(res),
  })
})

router.post('/', ensureAuth, async (req: Request, res: Response) => {
  const validation = TourInput.validate(req.body)
  if (validation.isLeft())
    return res.status(400).json({ error: validation.extract() })

  const input = validation.unsafeCoerce()

  if (new Types.ObjectId(input.author) != req.user!._id)
    return res.status(403).json({ error: accessDenied('Not the author') })

  const result = await TourService.createTour(input, req.user!._id)
  result.caseOf({
    Right: (tour) => res.status(201).json(tour),
    Left: (error) => {
      switch (error.type) {
        case 'DBError':
          return res.status(500).json({ error })
      }
    },
  })
})

router.patch('/:id', ensureAuth, async (req: Request, res: Response) => {
  const tourID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(tourID))
    return res.status(400).json({ message: 'Malformed tour ID' })

  const id = new Types.ObjectId(tourID)
  const validation = TourPatch.validate(req.body)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }
  const input = validation.unsafeCoerce()

  const result = await TourService.patchTour(id, input, userID)
  result.caseOf({
    Right: (tour) => res.json(tour),
    Left: handleLeft(res),
  })
})

router.delete('/:id', ensureAuth, async (req: Request, res: Response) => {
  const tourID = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(tourID))
    return res.status(400).json({ message: 'Malformed tour ID' })

  const id = new Types.ObjectId(tourID)
  const result = await TourService.deleteTour(id, userID)
  result.caseOf({
    Right: (tour) => res.json(tour),
    Left: handleLeft(res),
  })
})

export default router
