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

// write an signup api endpoint

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
router.get('/items', (req, res) => {
  // Return a list of item metadata
  res.json([]) // placeholder
})

// GET /items/:id
router.get('/items/:id', (req, res) => {
  // Return a single item by id
  res.json({}) // placeholder
})

// POST /items
router.post('/items', (req, res) => {
  // Create a new item
  res.status(201).json({}) // placeholder
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
