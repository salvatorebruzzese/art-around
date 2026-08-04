import express, { Router } from 'express'
import mongoose, { Model, Document, FilterQuery, Types } from 'mongoose'
import { Either, Left, Right } from 'purify-ts/Either'
import { NotFound, DBError, dbError, notFound } from './shared/errors.js'

// Importing the Mongoose models and interfaces
import {
  User,
  IUser,
  Museum,
  IMuseum,
  Tour,
  ITour,
  Item,
  IItem,
  Asset,
  IAsset,
} from './models.js'
import e from 'express'

export class BaseCrudService<T> {
  constructor(private model: Model<T>) {}

  async get(id: Types.ObjectId): Promise<Either<NotFound | DBError, T>> {
    try {
      const doc = await this.model.findById(id).lean().exec()
      return doc ? Right(doc as T) : Left(notFound())
    } catch (e) {
      return Left(dbError(undefined, () => String(e)))
    }
  }

  async list(
    query: FilterQuery<T> = {},
    projection?: string,
  ): Promise<Either<DBError, T[]>> {
    try {
      const items = await this.model.find(query, projection).lean().exec()
      return Right(items as T[])
    } catch (e) {
      return Left(dbError(undefined, () => String(e)))
    }
  }

  async create(input: Partial<T>): Promise<Either<DBError, T>> {
    try {
      const doc = await this.model.create(input)
      return Right(doc as T)
    } catch (e) {
      return Left(dbError(undefined, () => String(e)))
    }
  }

  async update(
    id: Types.ObjectId,
    input: Partial<T>,
  ): Promise<Either<DBError | NotFound, T>> {
    try {
      const doc = await this.model.findByIdAndUpdate(id, input)
      if (doc === null) return Left(notFound(() => 'Object does not exist'))

      return Right(doc)
    } catch (e) {
      return Left(dbError(undefined, () => String(e)))
    }
  }
}

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
      const id = new Types.ObjectId(req.params.id)
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

  router.patch('/:id', async (req, res) => {
    const id = new Types.ObjectId(req.params.id)
    const result = await service.update(id, req.body)

    result.caseOf({
      Left: (err) => {
        switch (err.type) {
          case 'DBError':
            res.status(500).json({ error: err })
            break
          case 'NotFound':
            res.status(500).json({ error: err })
            break
        }
      },
      Right: (data) => res.status(201).json(data),
    })
  })

  return router
}

// Instantiated middleware routers for each Mongoose model
export const userRouter = createCrudRouter<IUser>(User)
export const museumRouter = createCrudRouter<IMuseum>(Museum)
export const tourRouter = createCrudRouter<ITour>(Tour)
export const itemRouter = createCrudRouter<IItem>(Item)
export const assetRouter = createCrudRouter<IAsset>(Asset)
