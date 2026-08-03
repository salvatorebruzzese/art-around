import express from 'express'

const router = express.Router()

// API root handler
router.get('/', (_req, res) => {
  res.json({ message: 'Art Around API', version: '1.0.0' })
})

export default router
