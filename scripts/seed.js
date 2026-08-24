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

const USER_COUNT = 10
const MUSEUM_COUNT = 5
const TOURS_PER_MUSEUM = 4
const ITEMS_PER_TOUR = 8
const ASSETS_PER_USER = 30

const sampleMuseumsData = [
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

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function pad(num, size) {
  let s = num + ''
  while (s.length < size) s = '0' + s
  return s
}

async function seed() {
  try {
    await mongoose.connect(mongouri)
    mongoose.connection.useDb('artaround')
    console.log('Connected to MongoDB.')

    await Promise.all([
      Museum.deleteMany({}),
      Item.deleteMany({}),
      Asset.deleteMany({}),
      User.deleteMany({}),
      Tour.deleteMany({}),
    ])
    console.log('Cleared existing data.')

    // --- USERS ---
    const baseUsers = [
      {
        username: 'testuser',
        email: 'me@example.com',
        password: 'password123',
        role: Role['User'],
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: Role['Admin'],
      },
      {
        username: 'anotheruser',
        email: 'anotheruser@example.com',
        password: 'user987',
        role: Role['User'],
      },
    ]
    const genUsers = Array.from({ length: USER_COUNT - baseUsers.length }).map(
      (_, idx) => ({
        username: `user${pad(idx + 1, 2)}`,
        email: `user${pad(idx + 1, 2)}@example.com`,
        password: `pass${pad(idx + 1, 2)}`,
        role: idx % 5 === 0 ? Role['Admin'] : Role['User'],
      }),
    )
    const usersInput = [...baseUsers, ...genUsers]

    const users = []
    for (const u of usersInput) {
      const hashedPassword = await bcrypt.hash(u.password, 10)
      let user = await User.create({
        username: u.username,
        email: u.email,
        password: hashedPassword,
        role: u.role,
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

      let res = await User.findByIdAndUpdate(
        user._id,
        {
          profilePicture: profilePicture._id,
        },
        { new: true },
      )
      if (!res) continue
      user = res
      users.push(user)
      console.debug('Created user:', user.username)
    }

    // --- ASSETS PER USER ---
    // For each user, generate N assets, keep for later
    const userAssetsMap = new Map()
    for (const user of users) {
      const assetPromises = Array.from({ length: ASSETS_PER_USER }).map(
        async () =>
          Asset.create({
            author: user._id,
            data: await fetchRandomImageBuffer(800),
            datatype: 'image/jpeg',
            public: true,
          }),
      )
      const assets = await Promise.all(assetPromises)
      userAssetsMap.set(
        user._id.toString(),
        assets.map((a) => a._id),
      )
    }

    // --- MUSEUMS ---
    // Use sample data only for the first 5 museums
    const museumsData = sampleMuseumsData.slice(0, MUSEUM_COUNT)
    const museums = []
    for (const data of museumsData) {
      const museum = await Museum.create({ ...data, tours: [] })
      museums.push(museum)
    }

    // --- TOURS/Tours assignment ---
    // For each museum, assign TOURS_PER_MUSEUM tours with random users as authors, and random assets as thumbnails
    let totalTours = []
    for (const museum of museums) {
      for (let ti = 0; ti < TOURS_PER_MUSEUM; ti++) {
        // pick random author
        const author = getRandom(users)
        const assetList = userAssetsMap.get(author._id.toString())
        // rotate through author assets if more than 1 (cycle assets)
        const thumbnail = assetList[ti % assetList.length]
        const tour = await Tour.create({
          name: `Tour ${ti + 1} for ${museum.name}`,
          author: author._id,
          thumbnail,
          museum: museum._id,
          price: 5 + ti * 3,
          items: [],
          itemNav: [],
          description: `Description for tour ${ti + 1} at ${museum.name}`,
        })
        await User.findByIdAndUpdate(author._id, {
          $push: { authoredTours: tour._id },
        })
        // --- ITEMS ---
        const itemsData = generateItemsForTour(
          museum.name,
          author._id,
          tour._id,
          [...assetList], // pass fresh array (not mutate original)
          ITEMS_PER_TOUR,
        )
        const createdItems = await Item.insertMany(itemsData)
        createdItems.forEach((item, idx) => {
          if (idx > 1 && idx % 2 === 0) {
            Item.findByIdAndUpdate(
              item._id,
              {
                refs: [createdItems.at(idx - 1)._id],
              },
              { new: true },
            ).then((_res) => {})
          }
        })
        const itemIds = createdItems.map((i) => i._id)
        tour.items = itemIds
        tour.itemNav = itemIds.filter((_, idx) => idx % 2 === 0)
        await tour.save()
        await Museum.findByIdAndUpdate(museum._id, {
          $push: { tours: tour._id },
        })
        totalTours.push(tour)
        console.log(
          `Seeded: museum=${museum.name} tour=${tour.name} author=${author.username} items=${createdItems.length}`,
        )
      }
    }

    // Give each user some random purchasedTours for demo effect
    for (const user of users) {
      const n = Math.floor(Math.random() * 4) + 1
      const candidateTours = totalTours.filter(
        (t) => t.author.toString() !== user._id.toString(),
      )
      const chosen = []
      for (let i = 0; i < n && candidateTours.length > 0; i++) {
        const idx = Math.floor(Math.random() * candidateTours.length)
        chosen.push(candidateTours[idx]._id)
        candidateTours.splice(idx, 1)
      }
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { purchasedTours: { $each: chosen } },
      })
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
