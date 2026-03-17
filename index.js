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
res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Art Around</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 4rem auto; padding: 0 1rem; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    p { color: #555; }
    nav { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    a { font-size: 1.1rem; color: #2563eb; text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Art Around</h1>
  <p>Un'applicazione web full-stack e responsive per gestire le visite ai musei.</p>
  <nav>
    <a href="/marketplace">Marketplace</a>
    <a href="/navigator">Navigator</a>
    <a href="/api">API</a>
  </nav>
</body>
</html>`);
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
