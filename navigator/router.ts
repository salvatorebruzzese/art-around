import express from 'express'
import path from 'path'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.use('/', express.static(path.join(rootDir, '/index.html')))

export default router
