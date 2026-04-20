/* ========================== */
/*                            */
/*           SETUP            */
/*                            */
/* ========================== */

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config() // Load .env

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
global.rootDir = __dirname
global.startDate = null

import express from 'express'
import session from 'express-session'
import cors from 'cors'
import apiRouter from './api/index.js'

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt' // for hashing passwords
import MongooseModels from './api/mongoose.js' // Adjust the path as needed

/* ========================== */
/*                            */
/*  EXPRESS CONFIG & ROUTES   */
/*                            */
/* ========================== */

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Passport setup
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await MongooseModels.User.findById(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy')

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username
      const user = await MongooseModels.User.findOne({ username })
      if (!user) {
        return done(null, false, { message: 'User not found' })
      }

      // Compare hashed password
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return done(null, false, { message: 'Incorrect password' })
      }

      // Success
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }),
)

/* --- Marketplace (JS + WebComponents + Tailwind) --- */
app.use(
  '/marketplace',
  express.static(path.join(global.rootDir, 'marketplace/dist')),
)

/* --- Navigator (Vue 3 + Tailwind) --- */
app.use(
  '/navigator',
  express.static(path.join(global.rootDir, 'navigator/dist')),
)

/* --- Root landing page --- */
app.get('/', (req, res) => {
  res.sendFile(path.join(global.rootDir, 'index.html'))
})

app.use('/api', apiRouter)

export default app
