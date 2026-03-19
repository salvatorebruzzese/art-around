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
const apiRouter = require('./api/routes/index.js');




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
/*                            */
/*    ACTIVATE NODE SERVER    */
/*                            */
/* ========================== */

app.listen(8000, function () {
global.startDate = new Date();
console.log(`App listening on port 8000 started ${global.startDate.toLocaleString()}`);
});


/*       END OF SCRIPT        */
