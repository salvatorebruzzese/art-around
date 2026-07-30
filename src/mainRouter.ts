import express from 'express'
import itemRouter from './item/router.js'
import tourRouter from './tour/router.js'
import museumRouter from './museum/router.js'
import assetRouter from './asset/router.js'
import passport from 'passport'
import userService, { SignupInput } from './user/service.js'
import { assertNever } from './shared/utils.js'

const router = express.Router()

// API root handler
router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

router.use('/items', itemRouter)
router.use('/tours', tourRouter)
router.use('/museums', museumRouter)
router.use('/assets', assetRouter)

// NOTE: temporarily here!
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user })
})

router.post('/signup', async (req, res) => {
  const validation = SignupInput.validate(req.body)
  if (validation.isLeft()) {
    const error = validation.extract() // ValidationError
    return res.status(400).json({ error: error.message })
  }

  const signupResult = await userService.signup(validation.unsafeCoerce())

  return signupResult.caseOf({
    Right: (user) => res.status(201).json(user),
    Left: (error) => {
      switch (error.type) {
        case 'ConflictError':
          return res.status(409).json({ error: error.message })
        case 'DBError':
          return res.status(500).json({ error: error.message })
        default:
          assertNever(error)
      }
    },
  })
})

router.get('/profile', (_req, res) => {
  res.json({})
})

export default router
