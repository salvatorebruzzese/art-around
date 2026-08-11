import { join } from 'path'
import express from 'express'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.get('/', (req, res) => {
  if (req.baseUrl === '/login') {
    res.sendFile(join(rootDir, 'access/login.html'))
  } else if (req.baseUrl === '/signup') {
    res.sendFile(join(rootDir, 'access/signup.html'))
  } else if (req.baseUrl === '/profile') {
    res.sendFile(join(rootDir, 'access/profile.html'))
  }
})

router.use('/assets', express.static(join(rootDir, '/access/assets/')))

export default router
