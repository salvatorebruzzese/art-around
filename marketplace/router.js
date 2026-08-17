import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

/** @type {express.Router} */
const router = express.Router()

router.use('/assets', express.static(join(rootDir, 'marketplace/assets')))

router.all('/', (req, res) => {
  if (req.baseUrl === '/marketplace') {
    res.sendFile(join(rootDir, 'marketplace/marketplace.html'))
  } else if (req.baseUrl === '/editor') {
    res.sendFile(join(rootDir, 'marketplace/editor.html'))
  } else if (req.baseUrl === '/profile') {
    res.sendFile(join(rootDir, 'marketplace/profile.html'))
  }
})

export default router
