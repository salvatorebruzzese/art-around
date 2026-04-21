import express, { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import MongooseModels, {
  IUser,
  IItem,
  IMuseum,
  ITour,
  IAsset,
} from './mongoose.js'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
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
    const existing = await MongooseModels.User.findOne({ username })
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' })
    }
    const hashed = await bcrypt.hash(password, 10)
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
  } catch (err: any) {
    res.status(500).json({ error: 'Signup failed', details: err.message })
  }
})

router.get('/profile', (req: Request, res: Response) => {
  if ((req as any).isAuthenticated && (req as any).isAuthenticated())
    return res.json({ user: req.user })
  res.status(401).json({ error: 'Unauthorized' })
})

/**
 * ITEMS
 */
router.get('/items', async (req: Request, res: Response) => {
  try {
    const items = await MongooseModels.Item.find({}, 'name tags').lean()
    const result = items.map((item: any) => ({
      id: item._id,
      name: item.name,
      tags: item.tags,
    }))
    res.json(result)
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'Could not fetch items', details: err.message })
  }
})

router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await MongooseModels.Item.findById(req.params.id)
      .populate('images')
      .populate('tour')
      .lean()
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json(item)
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'Could not fetch item', details: err.message })
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
    const item = await MongooseModels.Item.create({
      name,
      tags,
      tour,
      images,
      description,
    })
    res.status(201).json(item)
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'Could not create item', details: err.message })
  }
})

router.patch('/items/:id', (req: Request, res: Response) => {
  res.json({})
})

/**
 * MUSEUMS
 */
router.get('/museums', (req: Request, res: Response) => {
  res.json([])
})

router.get('/museums/:id', (req: Request, res: Response) => {
  res.json({})
})

/**
 * TOURS
 */
router.get('/tours', (req: Request, res: Response) => {
  res.json([])
})

router.post('/tours', (req: Request, res: Response) => {
  res.status(201).json({})
})

router.patch('/tours/:id', (req: Request, res: Response) => {
  res.json({})
})

/**
 * USERS
 * (to be defined)
 */

/**
 * ASSETS
 */
router.get('/assets/:id', (req: Request, res: Response) => {
  res.json({})
})

router.post('/assets', (req: Request, res: Response) => {
  res.status(201).json({})
})

export default router
