/* ========================== */
/*                            */
/*           SETUP            */
/*                            */
/* ========================== */

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config() // Load .env

declare global {
  // Add your custom types here
  var rootDir: string
  var startDate: Date | null
}
export {}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
global.rootDir = process.cwd()
console.log(global.rootDir)

import express from 'express'
import session from 'express-session'
import cors from 'cors'
// @ts-ignore
import apiRouter from '../api/index.js'

// @ts-ignore
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt' // for hashing passwords

/* ========================== */
/*                            */
/*  EXPRESS CONFIG & ROUTES   */
/*                            */
/* ========================== */

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

import { User } from '../api/mongoose.js'
passport.serializeUser((user: any, done) => done(null, user.id))
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy')

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('Missing SESSION_SECRET in environment vars')
}
app.use(
  session({
    secret: sessionSecret,
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
      const user = await User.findOne({ username })
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
