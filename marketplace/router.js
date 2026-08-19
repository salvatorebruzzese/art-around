import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

/** @type {express.Router} */
const router = express.Router()

router.use('/assets', express.static(join(rootDir, 'marketplace/assets')))

router.get('/', (req, res) => {
  if (req.baseUrl === '/marketplace') {
    res.sendFile(join(rootDir, 'marketplace/marketplace.html'))
  } else if (req.baseUrl === '/editor') {
    res.sendFile(join(rootDir, 'marketplace/editor.html'))
  } else if (req.baseUrl === '/profile') {
    res.sendFile(join(rootDir, 'marketplace/profile.html'))
  } else if (req.baseUrl === '/checkout') {
    res.sendFile(join(rootDir, 'marketplace/checkout.html'))
  }
})

router.get('/:id', async (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/viewer.html'))
})

export default router
