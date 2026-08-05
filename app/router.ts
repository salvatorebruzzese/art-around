import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.use('/', express.static(join(rootDir, '/app/index.html')))

export default router
