import express from 'express'
import itemRouter from './item/router.js'
import tourRouter from './tour/router.js'
import museumRouter from './museum/router.js'
import assetRouter from './asset/router.js'
import passport from 'passport'
import userService, {
  ConflictError,
  DBError,
  SignupInput,
} from './user/service.js'
import { EitherAsync } from 'purify-ts'
import { ValidationError } from './shared/validation.js'
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

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user })
})

router.post('/signup', async (req, res) => {
  return await EitherAsync<
    ConflictError | DBError | ValidationError,
    SignupInput
  >(async ({ liftEither }) => {
    return liftEither(SignupInput.validate(req.body))
  })
    .chain(userService.signup)
    .run()
    .then((result) =>
      result.caseOf({
        Right: (user) => res.status(201).json(user),
        Left: (error) => {
          switch (error.type) {
            case 'ConflictError':
              res.status(409).json({ error: error.message })
              break
            case 'DBError':
              res.status(500).json({ error: error.message })
              break
            case 'ValidationError':
              res.status(400).json({ error: error.message })
              break
            default:
              assertNever(error)
          }
        },
      }),
    )
})

router.get('/profile', (_req, res) => {
  res.json({})
})

export default router
