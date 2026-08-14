import mongoose from 'mongoose'
import { Museum } from '../backend/museum/model.js'
import { Tour } from '../backend/tour/model.js'
import { User } from '../backend/user/model.js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env from root directory
dotenv.config({ path: path.join(process.cwd(), '.env') })

const mongouri = `mongodb://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_SITE}`

async function seed() {
  try {
    await mongoose.connect(mongouri)
    const db = mongoose.connection.useDb('artaround')
    console.log('Connected to MongoDB and switched to "artaround" database.')

    // Clear existing data (optional, remove in production)
    db.dropDatabase()
    console.log('Cleared existing data.')

    // 1. Create a user
    const user = await User.create({
      username: 'testuser',
      password: 'password123', // Note: This should be hashed in real apps
      role: 'User',
      authoredTours: [],
      purchasedTours: [],
      billingData: { cards: [], addresses: [] },
    })
    console.log('User created:', user.username)

    // 2. Create museums
    const museumsData = [
      {
        name: 'Louvre Museum',
        description: 'World-famous art museum in Paris.',
        address: 'Rue de Rivoli, 75001 Paris, France',
      },
      {
        name: 'The Metropolitan Museum of Art',
        description: 'The Met in New York City.',
        address: '1000 5th Ave, New York, NY 10028, USA',
      },
      {
        name: 'Uffizi Gallery',
        description: 'Prominent art museum in Florence.',
        address: 'Piazzale degli Uffizi, 6, 50122 Firenze FI, Italy',
      },
    ]

    for (const data of museumsData) {
      const museum = await Museum.create({ ...data, tours: [] })
      console.log('Museum created:', museum.name)

      // Create a tour for this museum
      const tour = await Tour.create({
        name: `Highlights of ${museum.name}`,
        author: user._id,
        price: 15,
        items: [],
        description: `Explore the best of ${museum.name}.`,
      })
      console.log('Tour created:', tour.name)

      // Add tour to museum
      await Museum.findByIdAndUpdate(museum._id, { $push: { tours: tour._id } })
      console.log(`Tour added to ${museum.name}.`)
    }

    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
  }
}

seed()
