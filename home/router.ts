import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'home/index.html'))
})

router.use('/', express.static(join(rootDir, '/home/')))

export default router
