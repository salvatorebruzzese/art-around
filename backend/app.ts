import express from 'express'
import session from 'express-session'
import passport from 'passport'
import marketRouter from '../marketplace/router.js'
import accessRouter from '../access/router.js'
import navigatorRouter from '../navigator/router.js'
import homeRouter from '../home/router.js'
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

app.get('/', (_req, res) => {
  res.redirect('/home')
})

app.use('/home', homeRouter)
app.use(['/login', '/signup'], accessRouter)
app.use(['/marketplace', '/editor'], marketRouter)
app.use('/navigator', navigatorRouter)
app.use('/api', mainRouter)

export default app
