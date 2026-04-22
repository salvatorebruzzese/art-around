import express from 'express'
import session from 'express-session'
import passport from 'passport'
import mainRouter from './mainRouter.js'
import './passportConfig.js'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

declare global {
  // Add your custom types here
  var rootDir: string
  var startDate: Date | null
}
export {}

// NOTE: Non possiamo fare assunzioni su quale sia la rootDir, o il percorso relativo
// Per ciò usiamo ricaviamo dalla posizione di app.js la 'root'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
global.rootDir = path.join(__dirname, '..')
dotenv.config({ path: path.join(global.rootDir, '.env') }) // Load .env

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
app.use(passport.initialize())
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(express.urlencoded({ extended: true }))

// NOTE: questo deve essere il primo middleware, altrimenti verrà servito come file statico
app.use('/api', mainRouter)
app.use(
  '/marketplace',
  express.static(path.join(global.rootDir, 'marketplace/')),
)
app.use('/navigator', express.static(path.join(global.rootDir, 'navigator/')))
export default app
