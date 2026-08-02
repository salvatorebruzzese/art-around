import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import dotenv from 'dotenv'
import request from 'supertest'
import app from '../app.js'
import mongoose from 'mongoose'
import { Item } from '../item/model.js'

dotenv.config({ path: '../../.env' })

const mongo_credentials = {
  user: process.env.MONGO_USR as string,
  pwd: process.env.MONGO_PWD as string,
  site: process.env.MONGO_SITE as string,
}

const mongouri = `mongodb://${mongo_credentials.user}:${mongo_credentials.pwd}@${mongo_credentials.site}`

describe('Items API', () => {
  beforeAll(async () => {
    await mongoose.connect(mongouri)
    const seedItems = [
      {
        name: 'Vase',
        tags: ['ceramic', 'ancient'],
        description: 'A clay vase.',
      },
      { name: 'Painting', tags: ['art', 'oil'], description: 'Oil on canvas.' },
    ]
    await Item.deleteMany({})
    await Item.insertMany(seedItems)
  })

  afterAll(async () => {
    await Item.deleteMany({})
    await mongoose.connection.db.dropDatabase()
    await mongoose.disconnect()
  })

  it('GET /items returns all items', async () => {
    const res = await request(app).get('/api/items')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /items creates a new item', async () => {
    const newItem = {
      name: 'Test Item',
      tags: ['tag1', 'tag2'],
      description: 'Test desc',
    }
    const res = await request(app).post('/api/items').send(newItem)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'Test Item' })
  })

  it('GET /items/:id returns an item', async () => {
    const created = await request(app)
      .post('/api/items')
      .send({ name: 'Single', tags: [] })
    const id: string = created.body._id
    const res = await request(app).get(`/api/items/${id}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Single')
  })
})
