import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { User, Tour, Item } from '../models.js'

// 1. Create a chainable mock to simulate Mongoose's .lean().exec() pattern
const createChainableMock = () => {
  const exec = vi.fn()
  const lean = vi.fn(() => ({ exec }))
  return {
    find: vi.fn(() => ({ lean })),
    findById: vi.fn(() => ({ lean })),
    create: vi.fn(),
  }
}

// 2. Mock the models used by BaseCrudService
vi.mock('./models.js', () => {
  return {
    User: createChainableMock(),
    Tour: createChainableMock(),
    Item: createChainableMock(),
    Asset: createChainableMock(),
  }
})

describe('Art Around API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- ROOT ROUTER TESTS ---

  it('should return the API status at GET /api/', async () => {
    // Tests the root path of the mainRouter
    const response = await request(app).get('/api/')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: 'Art Around API',
      version: '1.0.0',
    })
  })

  // --- CRUD SERVICE TESTS (e.g., Users & Tours) ---

  it('should return a list of users at GET /api/users', async () => {
    const mockUsers = [{ _id: '1', username: 'testuser' }]

    // Intercept the exec() call to return our mock data
    const exec = vi.fn().mockResolvedValue(mockUsers)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    User.find.mockReturnValue({ lean: () => ({ exec }) })

    const response = await request(app).get('/api/users')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockUsers)
    expect(User.find).toHaveBeenCalled()
  })

  it('should return a specific tour by ID at GET /api/tours/:id', async () => {
    const mockTour = { _id: '507f191e810c19729de860ea', name: 'Colosseum Tour' }

    const exec = vi.fn().mockResolvedValue(mockTour)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    Tour.findById.mockReturnValue({ lean: () => ({ exec }) })

    const response = await request(app).get(
      '/api/tours/507f191e810c19729de860ea',
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockTour)
  })

  it('should return 404 for a non-existent item ID', async () => {
    // Mock the DB returning null for a missing document
    const exec = vi.fn().mockResolvedValue(null)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    Item.findById.mockReturnValue({ lean: () => ({ exec }) })

    const response = await request(app).get(
      '/api/items/507f191e810c19729de860ea',
    )

    expect(response.status).toBe(404)
    expect(response.body.error).toBeDefined()
  })

  it('should handle invalid ObjectIds and return 400', async () => {
    // service.js includes a catch block specifically for invalid ObjectIds
    const response = await request(app).get('/api/assets/invalid-format-id')

    expect(response.status).toBe(400)
  })

  it('should create a new item at POST /api/items', async () => {
    const newItem = { name: 'Mona Lisa', tour: '507f191e810c19729de860ea' }
    const createdItem = { _id: '999', ...newItem }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    Item.create.mockResolvedValue(createdItem)

    const response = await request(app).post('/api/items').send(newItem)

    expect(response.status).toBe(201)
    expect(response.body).toEqual(createdItem)
    expect(Item.create).toHaveBeenCalledWith(newItem)
  })
})
