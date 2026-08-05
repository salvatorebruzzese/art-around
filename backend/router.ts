import express from 'express'
import {
  userRouter,
  museumRouter,
  tourRouter,
  itemRouter,
  assetRouter,
} from './service.js'

const router = express.Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

router.use('/users', userRouter)
router.use('/museums', museumRouter)
router.use('/tours', tourRouter)
router.use('/items', itemRouter)
router.use('/assets', assetRouter)

export default router
