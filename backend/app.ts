import express from 'express'
import session from 'express-session'
import passport from 'passport'
import rootDir from './rootdir.js'
import apiRouter from '../backend/router.js'
import marketRouter from '../marketplace/router.js'
import navigatorRouter from '../navigator/router.js'
import homeRouter from '../app/router.js'
import '../backend/passportConfig.js'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(rootDir, '.env') }) // Load .env

const requiredEnv = ['MONGO_USR', 'MONGO_PWD', 'MONGO_SITE', 'SESSION_SECRET']
const missing = requiredEnv.filter((envVar) => !process.env[envVar])
if (missing.length > 0) {
  console.error(
    `Error: Missing required environment variable(s): ${missing.join(', ')}`,
  )
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('Missing SESSION_SECRET in environment vars')
}

const app = express()
app.use(cors())
// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy')
app.use(express.json())
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: true }))

// NOTE: questo deve essere il primo middleware, altrimenti verrà servito come file statico
app.use('/', homeRouter)
app.use('/api', apiRouter)
app.use('/marketplace', marketRouter)
app.use('/navigator', navigatorRouter)

export default app
