import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import fetch from 'node-fetch'
import bcrypt from 'bcrypt'

import { Museum } from '../backend/museum/model.js'
import { Tour } from '../backend/tour/model.js'
import { User } from '../backend/user/model.js'
import { Asset } from '../backend/asset/model.js'
import { Item } from '../backend/item/model.js'
import { generateItemsForTour } from './data.js'
import { Role } from '../backend/accessControl.js'

async function fetchRandomImageBuffer(w = 600, h = 600) {
  const url = `https://picsum.photos/${w}/${h}`
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer)
}

dotenv.config({ path: path.join(process.cwd(), '.env') })

const mongouri = `mongodb://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_SITE}`

async function seed() {
  try {
    await mongoose.connect(mongouri)
    mongoose.connection.useDb('artaround')
    console.log('Connected to MongoDB.')

    // Pulizia database
    await Promise.all([
      Museum.deleteMany({}),
      Item.deleteMany({}),
      Asset.deleteMany({}),
      User.deleteMany({}),
      Tour.deleteMany({}),
    ])
    console.log('Cleared existing data.')

    // Creazione Utente principale
    const hashedPassword = await bcrypt.hash('password123', 10)
    let user = await User.create({
      username: 'testuser',
      email: 'me@example.com',
      password: hashedPassword,
      role: Role['User'],
      authoredTours: [],
      purchasedTours: [],
      billingData: { cards: [], addresses: [] },
    })

    const profilePicture = await Asset.create({
      author: user._id,
      data: await fetchRandomImageBuffer(200, 200),
      datatype: 'image/jpeg',
      public: true,
    })

    const update = await User.findByIdAndUpdate(
      user._id,
      {
        profilePicture: profilePicture._id,
      },
      { new: true },
    )
    user = update ? update : user

    // Creazione Utente Admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role['Admin'],
      authoredTours: [],
      purchasedTours: [],
      billingData: { cards: [], addresses: [] },
    })

    // Creazione Secondo Utente
    const secondPassword = await bcrypt.hash('user987', 10)
    let secondUser = await User.create({
      username: 'anotheruser',
      email: 'anotheruser@example.com',
      password: secondPassword,
      role: Role['User'],
      authoredTours: [],
      purchasedTours: [],
      billingData: { cards: [], addresses: [] },
    })

    const secondProfilePicture = await Asset.create({
      author: secondUser._id,
      data: await fetchRandomImageBuffer(200, 200),
      datatype: 'image/jpeg',
      public: true,
    })

    const updatedSecondUser = await User.findByIdAndUpdate(
      secondUser._id,
      {
        profilePicture: secondProfilePicture._id,
      },
      { new: true },
    )
    secondUser = updatedSecondUser ? updatedSecondUser : secondUser

    console.debug('Created user:', user)
    console.debug('Created admin:', admin)
    console.debug('Created another user:', secondUser)

    // Creazione pool di Asset condivisi
    const assetPromises = Array.from({ length: 5 }).map(async () =>
      Asset.create({
        author: user._id,
        data: await fetchRandomImageBuffer(),
        datatype: 'image/jpeg',
        public: true,
      }),
    )
    const assets = await Promise.all(assetPromises)
    const assetIds = assets.map((a) => a._id as mongoose.Types.ObjectId)

    // Creazione asset per altro user
    const asset2Promises = Array.from({ length: 3 }).map(async () =>
      Asset.create({
        author: secondUser._id,
        data: await fetchRandomImageBuffer(),
        datatype: 'image/jpeg',
        public: true,
      }),
    )
    const assets2 = await Promise.all(asset2Promises)
    const asset2Ids = assets2.map((a) => a._id as mongoose.Types.ObjectId)

    const museumsData = [
      {
        name: 'Louvre Museum',
        address: 'Rue de Rivoli, 75001 Paris, France',
        description: 'World-famous art museum in Paris.',
      },
      {
        name: 'The Metropolitan Museum of Art',
        address: '1000 5th Ave, New York, NY 10028, USA',
        description: 'The Met in New York City.',
      },
      {
        name: 'Uffizi Gallery',
        address: 'Piazzale degli Uffizi, 6, 50122 Firenze FI, Italy',
        description: 'Prominent art museum in Florence.',
      },
    ]

    for (const data of museumsData) {
      const museum = await Museum.create({ ...data, tours: [] })

      const tour = await Tour.create({
        name: `Highlights of ${museum.name}`,
        author: user._id,
        thumbnail: assetIds[0],
        museum: museum._id,
        price: 15,
        items: [],
        description: `Explore the best of ${museum.name}.`,
      })

      await User.findByIdAndUpdate(user._id, {
        $push: { authoredTours: tour._id },
      })

      // Generazione di 10 item per tour tramite modulo helper
      const itemsData = generateItemsForTour(
        museum.name,
        user._id as mongoose.Types.ObjectId,
        tour._id as mongoose.Types.ObjectId,
        assetIds,
        10,
      )
      const createdItems = await Item.insertMany(itemsData)

      // Aggiornamento riferimenti nel tour e nel museo
      const itemIds = createdItems.map((i) => i._id)
      tour.items = itemIds as mongoose.Types.ObjectId[]
      await tour.save()

      await Museum.findByIdAndUpdate(museum._id, { $push: { tours: tour._id } })
      console.log(
        `Seeded ${museum.name} with Tour and ${createdItems.length} items. (user1)`,
      )
    }

    // Creazione Museo e Tour per altro user
    const museumsData2 = [
      {
        name: 'Museo Egizio',
        address: 'Via Accademia delle Scienze, 6, 10123 Torino TO, Italy',
        description: 'Famous museum dedicated to Egyptian antiquities.',
      },
      {
        name: 'Museo di Capodimonte',
        address: 'Via Miano, 2, 80131 Napoli NA, Italy',
        description: 'Art museum in Naples with a vast collection.',
      },
    ]

    for (const data of museumsData2) {
      const museum = await Museum.create({ ...data, tours: [] })
      const tour = await Tour.create({
        name: `Best of ${museum.name}`,
        author: secondUser._id,
        thumbnail: asset2Ids[0],
        museum: museum._id,
        price: 8,
        items: [],
        description: `Discover ${museum.name}`,
      })

      await User.findByIdAndUpdate(secondUser._id, {
        $push: { authoredTours: tour._id },
      })

      // Generazione di 7 item per ognuno di questi tour
      const itemsData = generateItemsForTour(
        museum.name,
        secondUser._id as mongoose.Types.ObjectId,
        tour._id as mongoose.Types.ObjectId,
        asset2Ids,
        7,
      )
      const createdItems = await Item.insertMany(itemsData)

      // Update references in tour and museum
      const itemIds = createdItems.map((i) => i._id)
      tour.items = itemIds as mongoose.Types.ObjectId[]
      await tour.save()

      await Museum.findByIdAndUpdate(museum._id, { $push: { tours: tour._id } })
      console.log(
        `Seeded ${museum.name} with Tour and ${createdItems.length} items. (anotheruser)`,
      )
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
