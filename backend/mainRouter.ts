import express from 'express'
import itemRouter from './item/router.js'
import tourRouter from './tour/router.js'
import museumRouter from './museum/router.js'
import assetRouter from './asset/router.js'
import userRouter from './asset/router.js'
import passport from 'passport'
import { signup } from './user/router.js'

const router = express.Router()

// API root handler
router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

router.use('/items', itemRouter)
router.use('/tours', tourRouter)
router.use('/museums', museumRouter)
router.use('/assets', assetRouter)
router.use('/users', userRouter)

// NOTE: temporarily here!
router.post('/login', (req, res, next) => {
  passport.authenticate(
    'local',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err: any, user: Express.User, info: { message: any }) => {
      if (err) return next(err)
      if (!user)
        return res.status(401).json({ error: info?.message || 'Unauthorized' })
      req.logIn(user, (err) => {
        if (err) return next(err)
        res.json({ user })
      })
    },
  )(req, res, next)
})

router.post('/signup', signup)

router.get('/profile', (_req, res) => {
  res.json({})
})

export default router
