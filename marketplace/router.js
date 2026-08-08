import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

/** @type {express.Router} */
const router = express.Router()

router.use('/assets', express.static(join(rootDir, 'marketplace/assets')))

router.get('/card.html', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/card.html'))
})

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/index.html'))
})

export default router
