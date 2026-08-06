import { join } from 'path'
import express from 'express'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/index.html'))
})

router.get('/login', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/login.html'))
})

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'marketplace/signup.html'))
})

export default router
