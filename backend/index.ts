import app from './app.js'
import rootDir from './rootdir.js'
import mongoose from 'mongoose'

const MONGO_USR = process.env.MONGO_USR as string
const MONGO_PWD = process.env.MONGO_PWD as string
const MONGO_SITE = process.env.MONGO_SITE as string
const mongouri = `mongodb://${MONGO_USR}:${MONGO_PWD}@${MONGO_SITE}`

try {
  await mongoose.connect(mongouri)
  mongoose.connection.useDb('artaround')
  console.log('MongoDB connection successful!')
} catch (err) {
  console.error('MongoDB connection failed:', err)
}

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  const startDate = new Date()
  console.log('Root dir: ' + rootDir)
  console.log(
    `App listening on port 8000 started ${startDate.toLocaleString()}`,
  )
})
