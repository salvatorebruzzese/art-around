import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'home/index.html'))
})

router.get('/login', (req, res) =>
  res.sendFile(join(rootDir, 'home/login.html')),
)

router.get('/signup', (req, res) =>
  res.sendFile(join(rootDir, 'home/signup.html')),
)

export default router
