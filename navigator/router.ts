import express from 'express'
import { join } from 'path'

const router = express.Router()

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/index.html'))
})

export default router
