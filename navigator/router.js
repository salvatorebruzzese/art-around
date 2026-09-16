import express from 'express'
import { join } from 'path'
import rootDir from '../backend/rootdir.js'

const router = express.Router()

router.use('/assets/', express.static(join(rootDir, '/navigator/assets')))

router.get('/', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/index.html'))
})

router.get('/libre', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/libre.html'))
})

router.get('/libre/:id', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/tour.html'))
})

router.get('/master', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/master.html'))
})

router.get('/master/:id', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/tour.html'))
})

router.get('/guided', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/guided.html'))
})

router.get('/guided/:id', (req, res) => {
  res.sendFile(join(rootDir, 'navigator/tour.html'))
})

export default router
