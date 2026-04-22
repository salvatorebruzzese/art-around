import express from 'express'
import itemRouter from './item/router.js'
import tourRouter from './tour/router.js'
import museumRouter from './museum/router.js'
import assetRouter from './asset/router.js'
import passport from 'passport'
import { signupService } from './user/service.js'

const router = express.Router()

// API root handler
router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

router.use('/items', itemRouter)
router.use('/tours', tourRouter)
router.use('/museums', museumRouter)
router.use('/assets', assetRouter)

// Auth routes from old api/routes/auth.ts now integrated below. See imports above for passport and signupService.
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user })
})
router.post('/signup', async (req, res) => {
  const { username, password } = req.body
  const result = await signupService({ username, password })
  result.match(
    (user) => {
      req.login(user, (err) => {
        if (err)
          return res.status(500).json({ error: 'Login after signup failed' })
        res.json({ user })
      })
    },
    (error) => {
      switch (error.type) {
        case 'ValidationError':
          return res.status(400).json({ error: error.message })
        case 'Conflict':
          return res.status(409).json({ error: error.message })
        case 'DBError':
          return res
            .status(500)
            .json({ error: 'Signup failed', details: error.details })
      }
    },
  )
})
router.get('/profile', (_req, res) => {
  res.json({})
})

export default router
