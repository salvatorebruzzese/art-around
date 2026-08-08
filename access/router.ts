import { join } from 'path'
import express from 'express'

const router = express.Router()

router.all('/', (req, res) => {
  if (req.baseUrl === '/login') {
    res.sendFile(join(rootDir, 'access/login.html'))
  } else if (req.baseUrl === '/signup') {
    res.sendFile(join(rootDir, 'access/signup.html'))
  }
})

export default router
