import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.use('/assets/', express.static(join(rootDir, '/navigator/assets')))

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/index.html'))
})

router.get('/:id', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/src/tour.html'))
})

export default router
