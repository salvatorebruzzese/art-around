import express from 'express'
import { userRouter, tourRouter, itemRouter, assetRouter } from './service.js'

const router = express.Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

// Attach your model routers to the `router`, NOT to `app`!
router.use('/users', userRouter)
router.use('/tours', tourRouter)
router.use('/items', itemRouter)
router.use('/assets', assetRouter)

// Simply export the router. No app.listen() here!
export default router
