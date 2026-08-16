import mongoose from 'mongoose'
import { Museum } from '../backend/museum/model.js'
import { Tour } from '../backend/tour/model.js'
import { User } from '../backend/user/model.js'
import dotenv from 'dotenv'
import path from 'path'
import fetch from 'node-fetch'
import { Asset } from '../backend/asset/model.js'
import { Item } from '../backend/item/model.js'

async function fetchRandomImageBuffer() {
  // Example random image URL
  const url = 'https://picsum.photos/200/300'
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer) // This is a Buffer containing the image data
}

// Load .env from root directory
dotenv.config({ path: path.join(process.cwd(), '.env') })

const mongouri = `mongodb://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_SITE}`

async function seed() {
  try {
    await mongoose.connect(mongouri)
    mongoose.connection.useDb('artaround')
    console.log('Connected to MongoDB and switched to "artaround" database.')

    // Clear existing data (optional, remove in production)
    await Museum.deleteMany({})
    await Item.deleteMany({})
    await Asset.deleteMany({})
    await User.deleteMany({})
    await Tour.deleteMany({})
    console.log('Cleared existing data.')

    // Create a user
    const user = await User.create({
      username: 'testuser',
      password: 'password123', // Note: This should be hashed in real apps
      role: 'User',
      authoredTours: [],
      purchasedTours: [],
      billingData: { cards: [], addresses: [] },
    })
    console.log('User created:', user.username)

    // Create museums
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

      // Create asset
      const thumbnail = await Asset.create({
        author: user._id,
        data: await fetchRandomImageBuffer(),
        datatype: 'image/jpeg',
        public: true,
      })

      // Create a tour for this museum
      const tour = await Tour.create({
        name: `Highlights of ${museum.name}`,
        author: user._id,
        thumbnail: thumbnail._id,
        museum: museum._id,
        price: 15,
        items: [],
        description: `Explore the best of ${museum.name}.`,
      })
      console.log('Tour created:', tour.name)
      console.log('with thumbnail: ', tour.thumbnail)

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
