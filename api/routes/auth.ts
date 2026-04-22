import express, { Request, Response } from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import { User } from '../models/index.js'

const router = express.Router()

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
    const user = await User.create({ username, password: hashed })
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

export default router
