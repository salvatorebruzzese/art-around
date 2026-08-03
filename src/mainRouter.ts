import express from 'express'
import {
  userRouter,
  tourRouter,
  itemRouter,
  assetRouter,
} from './BaseCrudService.js'

const app = express()
app.use(express.json())

const router = express.Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

// API Root
app.use('/', router)

// Model Routers
app.use('/users', userRouter)
app.use('/tours', tourRouter)
app.use('/items', itemRouter)
app.use('/assets', assetRouter)

app.listen(8000, () => console.log('Server running on port 8000'))

export default router
