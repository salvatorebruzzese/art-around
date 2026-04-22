import express, { Request, Response } from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import { User, Item, IItem } from './mongoose.js'

const router = express.Router()

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

router.post(
  '/login',
  passport.authenticate('local'),
  (req: Request, res: Response) => {
    res.json({ user: req.user })
  },
)

router.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username: string
    password: string
  }
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }
  try {
    const existing = await User.findOne({ username })
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
      username: username,
      password: hashed,
    })
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login after signup failed' })
      }
      res.json({ user })
    })
  } catch (err: unknown) {
    res.status(500).json({
      error: 'Signup failed',
      details: err instanceof Error ? err.message : String(err),
    })
  }
})

router.get('/profile', (req: Request, res: Response) => {
  res.json({})
})

/**
 * ITEMS
 */
router.get('/items', async (_req: Request, res: Response) => {
  try {
    const items = await Item.find({}, 'name tags').lean()
    const result = items.map((item: IItem) => ({
      id: item._id,
      name: item.name,
      tags: item.tags,
    }))
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({
      error: 'Could not fetch items',
      details: err instanceof Error ? err.message : String(err),
    })
  }
})

router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('images')
      .populate('tour')
      .lean()
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json(item)
  } catch (err: unknown) {
    res.status(500).json({
      error: 'Could not fetch items',
      details: err instanceof Error ? err.message : String(err),
    })
  }
})

router.post('/items', async (req: Request, res: Response) => {
  try {
    const { name, tags, tour, images, description } = req.body as {
      name: string
      tags?: string[]
      tour?: string
      images?: string[]
      description?: string
    }
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    const item = await Item.create({
      name,
      tags,
      tour,
      images,
      description,
    })
    res.status(201).json(item)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Could not create item', details: message })
  }
})

router.patch('/items/:id', (_req: Request, res: Response) => {
  res.json({})
})

/**
 * MUSEUMS
 */
router.get('/museums', (_req: Request, res: Response) => {
  res.json([])
})

router.get('/museums/:id', (_req: Request, res: Response) => {
  res.json({})
})

/**
 * TOURS
 */
router.get('/tours', (_req: Request, res: Response) => {
  res.json([])
})

router.post('/tours', (_req: Request, res: Response) => {
  res.status(201).json({})
})

router.patch('/tours/:id', (_req: Request, res: Response) => {
  res.json({})
})

/**
 * USERS
 * (to be defined)
 */

/**
 * ASSETS
 */
router.get('/assets/:id', (_req: Request, res: Response) => {
  res.json({})
})

router.post('/assets', (_req: Request, res: Response) => {
  res.status(201).json({})
})

export default router
