import { join } from 'path'
import express from 'express'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.use('/login', express.static(join(rootDir, '/login.html')))

router.use('/signup', express.static(join(rootDir, '/signup.html')))

export default router
