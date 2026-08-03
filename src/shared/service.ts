import { Model, Types, FilterQuery } from 'mongoose'
import { Either, Left, Right } from 'purify-ts/Either'
import { NotFound, DBError, dbError, notFound } from './errors.js'

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
}
