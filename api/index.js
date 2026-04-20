import express from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import MongooseModels from './mongoose.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user })
})

router.post('/signup', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  try {
    // Check if user exists
    const existing = await MongooseModels.User.findOne({ username })
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' })
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10)
    // Create user
    const user = await MongooseModels.User.create({
      username: username,
      password: hashed,
    })
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login after signup failed' })
      }
      res.json({ user })
    })
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', details: err.message })
  }
})

router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) return res.json({ user: req.user })
  res.status(401).json({ error: 'Unauthorized' })
})

/**
 * ITEMS
 */
// GET /items
// Return a list of item metadata
router.get('/items', async (req, res) => {
  try {
    const items = await MongooseModels.Item.find({}, 'name tags').lean()
    const result = items.map((item) => ({
      id: item._id,
      name: item.name,
      tags: item.tags,
    }))
    res.json(result)
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Could not fetch items', details: err.message })
  }
})

// GET /items/:id
// Return a single item by id
router.get('/items/:id', async (req, res) => {
  try {
    const item = await MongooseModels.Item.findById(req.params.id)
      .populate('images')
      .populate('tour')
      .lean()
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json(item)
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Could not fetch item', details: err.message })
  }
})

// POST /items
// Create a new item
router.post('/items', async (req, res) => {
  try {
    const { name, tags, tour, images, description } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    const item = await MongooseModels.Item.create({
      name,
      tags,
      tour,
      images,
      description,
    })
    res.status(201).json(item)
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Could not create item', details: err.message })
  }
})

// PATCH /items/:id
router.patch('/items/:id', (req, res) => {
  // Update an item by id
  res.json({}) // placeholder
})

/**
 * MUSEUMS
 */
// GET /museums
router.get('/museums', (req, res) => {
  // Return a list of museum metadata
  res.json([]) // placeholder
})

// GET /museums/:id
router.get('/museums/:id', (req, res) => {
  // Return a museum by id
  res.json({}) // placeholder
})

/**
 * TOURS
 */
// GET /tours
router.get('/tours', (req, res) => {
  // Return a list of tour metadata
  res.json([]) // placeholder
})

// POST /tours
router.post('/tours', (req, res) => {
  // Create a new tour
  res.status(201).json({}) // placeholder
})

// PATCH /tours/:id
router.patch('/tours/:id', (req, res) => {
  // Update a tour by id
  res.json({}) // placeholder
})

/**
 * USERS
 * (da definire)
 */

/**
 * ASSETS
 */
// GET /assets/:id
router.get('/assets/:id', (req, res) => {
  // Return an asset by id
  res.json({}) // placeholder
})

// POST /assets
router.post('/assets', (req, res) => {
  // Create a new asset
  res.status(201).json({}) // placeholder
})

export default router
