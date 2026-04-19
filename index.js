/* ========================== */
/*                            */
/*           SETUP            */
/*                            */
/* ========================== */

global.rootDir = __dirname;
global.startDate = null;

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./api/index.js');




/* ========================== */
/*                            */
/*  EXPRESS CONFIG & ROUTES   */
/*                            */
/* ========================== */

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy');


/* --- Marketplace (JS + WebComponents + Tailwind) --- */
app.use('/marketplace', express.static(path.join(global.rootDir, 'marketplace/dist')));


/* --- Navigator (Vue 3 + Tailwind) --- */
app.use('/navigator', express.static(path.join(global.rootDir, 'navigator/dist')));


/* --- REST API --- */
app.use('/api', apiRouter);


/* --- Root landing page --- */
app.get('/', (req, res) => {
  res.sendFile(path.join(global.rootDir, 'index.html'));
});


/* ========================== */
/*           MONGO            */
/* ========================== */

require('dotenv').config(); // Load .env
// Controlla se esistono
const requiredEnv = ['MONGO_USR', 'MONGO_PWD', 'MONGO_SITE'];
const missing = requiredEnv.filter(envVar => !process.env[envVar]);
if (missing.length > 0) {
  console.error(`Error: Missing required environment variable(s): ${missing.join(', ')}`);
}

const mongo_credentials = {
  user: process.env.MONGO_USR,
  pwd: process.env.MONGO_PWD,
  site: process.env.MONGO_SITE
};

// How to use:
// const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;


async function testMongoConnection() {
    const { MongoClient } = require('mongodb');
    const mongouri = `mongodb://${mongo_credentials.user}:${mongo_credentials.pwd}@${mongo_credentials.site}?writeConcern=majority`;
    const client = new MongoClient(mongouri, { useUnifiedTopology: true });

    try {
        await client.connect();
        const databasesList = await client.db().admin().listDatabases();
        console.log('MongoDB connection successful!');
        console.log('Databases:', databasesList.databases.map(db => db.name));
    } catch (err) {
        console.error('MongoDB connection failed:', err);
    } finally {
        await client.close();
    }
}

testMongoConnection();


/* ========================== */
/*                            */
/*    ACTIVATE NODE SERVER    */
/*                            */
/* ========================== */

app.listen(8000, () => {
  global.startDate = new Date();
  console.log(`App listening on port 8000 started ${global.startDate.toLocaleString()}`);
});


/*       END OF SCRIPT        */
