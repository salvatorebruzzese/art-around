import express, { Request, Response } from 'express'
import { AssetInput, AssetPatch, AssetQuery } from './model.js'
import AssetService from './service.js'
import mongoose, { Types } from 'mongoose'
import { ensureAuth } from '../accessControl.js'
import { handleLeft } from '../shared/router.js'
import multer from 'multer'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  // Explicit validation
  const validation = AssetQuery.validate(req.query)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const query = validation.unsafeCoerce()
  const result = await AssetService.listAssets(query)
  result.caseOf({
    Right: (assetList) => res.json(assetList),
    Left: handleLeft(res),
  })
})

router.get('/:id', async (req, res) => {
  const validation = AssetQuery.validate(req.params)

  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }

  const assetID = req.params.id as string

  if (!mongoose.Types.ObjectId.isValid(assetID))
    return res.status(400).json({ message: 'Malformed asset ID' })

  const id = new Types.ObjectId(assetID)
  const result = req.user
    ? await AssetService.getAsset(id, req.user!._id)
    : await AssetService.getAsset(id)

  result.caseOf({
    // TODO(maybe): separate endopoint for metadata
    Right: (value) => res.set('Content-Type', value.datatype).send(value.data),
    Left: handleLeft(res),
  })
})

router.post(
  '/',
  ensureAuth,
  multer().single('data'),
  async (req: Request, res: Response) => {
    // Explicit validation
    const validation = AssetInput.validate(req.body)
    if (validation.isLeft())
      return res.status(400).json({ error: validation.extract() })
    const input = validation.unsafeCoerce()
    if (req.file) {
      input.data = req.file.buffer
    }
    const result = await AssetService.createAsset(input, req.user!._id)
    result.caseOf({
      Right: (asset) => res.status(201).json(asset),
      Left: (error) => {
        switch (error.type) {
          case 'DBError':
            return res.status(500).json({ error })
          case 'AccessDenied':
            return res.status(403).json({ error })
          case 'ValidationError':
            return res.status(400).json({ error })
        }
      },
    })
  },
)

router.patch('/:id', ensureAuth, async (req: Request, res: Response) => {
  const assetID = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(assetID))
    return res.status(400).json({ message: 'Malformed asset ID' })

  const id = new Types.ObjectId(assetID)

  // Validate input
  const validation = AssetPatch.validate(req.body)
  if (validation.isLeft()) {
    return res.status(400).json({ error: validation.extract() })
  }
  const input = validation.unsafeCoerce()

  const result = await AssetService.patchAsset(id, input, userID)
  result.caseOf({
    Right: (asset) => res.json(asset),
    Left: handleLeft(res),
  })
})

router.delete('/:id', ensureAuth, async (req: Request, res: Response) => {
  const assetID = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id
  const userID = req.user!._id
  if (!mongoose.Types.ObjectId.isValid(assetID))
    return res.status(400).json({ message: 'Malformed asset ID' })

  const id = new Types.ObjectId(assetID)
  const result = await AssetService.deleteAsset(id, userID)
  result.caseOf({
    Right: (asset) => res.json(asset),
    Left: handleLeft(res),
  })
})

export default router
