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
import mongoose from 'mongoose'
import MongooseModels from './api/mongoose.js' // Adjust the path as needed

// Controlla se esistono le variabili necessarie
const requiredEnv = ['MONGO_USR', 'MONGO_PWD', 'MONGO_SITE', 'SESSION_SECRET']
const missing = requiredEnv.filter((envVar) => !process.env[envVar])
if (missing.length > 0) {
  console.error(
    `Error: Missing required environment variable(s): ${missing.join(', ')}`,
  )
}

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

/* ========================== */
/*           MONGO            */
/* ========================== */

const mongo_credentials = {
  user: process.env.MONGO_USR,
  pwd: process.env.MONGO_PWD,
  site: process.env.MONGO_SITE,
}

// How to use:
// const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

const mongouri = `mongodb://${mongo_credentials.user}:${mongo_credentials.pwd}@${mongo_credentials.site}?writeConcern=majority`
try {
  await mongoose.connect(mongouri)
  console.log('MongoDB connection successful!')
} catch (err) {
  console.error('MongoDB connection failed:', err)
}

/* ========================== */
/*                            */
/*    ACTIVATE NODE SERVER    */
/*                            */
/* ========================== */

app.listen(8000, () => {
  global.startDate = new Date()
  console.log(
    `App listening on port 8000 started ${global.startDate.toLocaleString()}`,
  )
})
