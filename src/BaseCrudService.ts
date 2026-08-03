import express, { Router } from 'express'
import mongoose, { Model, Document, FilterQuery } from 'mongoose'

// Importing the BaseCrudService
import { BaseCrudService } from './shared/service.js'

// Importing the Mongoose models and interfaces
import { User, IUser } from './user-model.js'
import { Tour, ITour } from './tour-model.js'
import { Item, IItem } from './item-model.js'
import { Asset, IAsset } from './asset-model.js'

/**
 * Generic factory function to create a CRUD router for any Mongoose model.
 */
function createCrudRouter<T extends Document>(model: Model<T>): Router {
  const router = express.Router()
  const service = new BaseCrudService<T>(model)

  // List items
  router.get('/', async (req, res) => {
    // Passes the query parameters to the service's list method
    const result = await service.list(req.query as FilterQuery<T>)

    result.caseOf({
      Left: (err) => res.status(500).json({ error: err }),
      Right: (data) => res.status(200).json(data),
    })
  })

  // Get item by ID
  router.get('/:id', async (req, res) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id)
      const result = await service.get(id)

      result.caseOf({
        // Assuming NotFound error maps to 404, otherwise 500 for DBError
        Left: (err) =>
          res.status(err.type === 'NotFound' ? 404 : 500).json({ error: err }),
        Right: (data) => res.status(200).json(data),
      })
    } catch (error) {
      // Catch invalid ObjectId casting errors
      res.status(400).json({ error })
    }
  })

  // Create item
  router.post('/', async (req, res) => {
    const result = await service.create(req.body)

    result.caseOf({
      Left: (err) => res.status(500).json({ error: err }),
      Right: (data) => res.status(201).json(data),
    })
  })

  return router
}

// Instantiated middleware routers for each Mongoose model
export const userRouter = createCrudRouter<IUser>(User)
export const tourRouter = createCrudRouter<ITour>(Tour)
export const itemRouter = createCrudRouter<IItem>(Item)
export const assetRouter = createCrudRouter<IAsset>(Asset)
