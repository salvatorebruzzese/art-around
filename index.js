import app from './app.js'
import mongoose from 'mongoose'

import dotenv from 'dotenv'
dotenv.config() // Load .env

// Controlla se esistono le variabili necessarie
const requiredEnv = ['MONGO_USR', 'MONGO_PWD', 'MONGO_SITE', 'SESSION_SECRET']
const missing = requiredEnv.filter((envVar) => !process.env[envVar])
if (missing.length > 0) {
  console.error(
    `Error: Missing required environment variable(s): ${missing.join(', ')}`,
  )
}
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
  mongoose.connection.useDb('artaround')
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
