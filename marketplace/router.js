import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

/** @type {express.Router} */
const router = express.Router()

router.use('/assets', express.static(join(rootDir, 'marketplace/assets')))

router.get('/card.html', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/card.html'))
})

router.get('/(marketplace)?', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/marketplace.html'))
})

router.get('/editor', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/editor.html'))
})

export default router
