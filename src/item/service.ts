import { err, ok, Result } from 'neverthrow'
import { Item, IItem } from './model.js'

export type ItemServiceError =
  | { type: 'NotFound' }
  | { type: 'ValidationError'; message: string }
  | { type: 'DBError'; details: string }

export type ItemSummary = {
  id: IItem['_id']
  name: IItem['name']
  tags: IItem['tags']
}

// Since the input is most-likely some json with string-fields we represent it like this.
export type ItemInput = {
  name: string
  tags?: string[]
  tour?: string
  images?: string[]
  description?: string
}

export default {
  // TODO: take for input some selectors
  async listItems(): Promise<Result<ItemSummary[], ItemServiceError>> {
    try {
      const items = await Item.find({}, 'name tags').lean()
      const result = items.map((item: IItem) => ({
        id: item._id,
        name: item.name,
        tags: item.tags,
      }))
      return ok(result)
    } catch (e) {
      return err({ type: 'DBError', details: String(e) })
    }
  },

  // Returns: Result<IItem, ItemServiceError>
  async getItem(id: string): Promise<Result<IItem, ItemServiceError>> {
    try {
      const item = await Item.findById(id)
      if (!item) return err({ type: 'NotFound' })
      return ok(item)
    } catch (e) {
      return err({ type: 'DBError', details: String(e) })
    }
  },

  async createItem(input: ItemInput): Promise<Result<IItem, ItemServiceError>> {
    const { name, tags, tour, images, description } = input
    if (!name)
      return err({ type: 'ValidationError', message: 'Name is required' })
    try {
      const item = await Item.create({ name, tags, tour, images, description })
      return ok(item)
    } catch (e) {
      return err({ type: 'DBError', details: String(e) })
    }
  },
}
