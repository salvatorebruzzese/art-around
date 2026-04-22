import express from 'express'
import {
  authRouter,
  itemsRouter,
  museumsRouter,
  toursRouter,
  assetsRouter,
} from './routes/index.js'

const router = express.Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

router.use('/items', itemsRouter)
router.use('/museums', museumsRouter)
router.use('/tours', toursRouter)
router.use('/assets', assetsRouter)
router.use(authRouter) // handles /login, /signup, /profile

export default router
