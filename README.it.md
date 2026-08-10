[English](README.md) | [Italiano](README.it.md)

# Art around

Un'applicazione web full-stack e responsive per gestire le visite ai musei, sviluppata come progetto del corso Tecnologie Web A.A. 2025/2026 dell'Università di Bologna.

## Architettura e Moduli

Il sistema adotta un approccio basato sul goal-oriented design ed è suddiviso in due moduli principali:

- Marketplace: Piattaforma desktop-first per la creazione, l'editing (con supporto LLM per la generazione di percorsi) e la distribuzione delle visite.

- Navigator: Web-app mobile-first per l'utente finale e le guide (sincronizzazione in tempo reale). Offre geolocalizzazione indoor, lettura con sintesi vocale e interazione tramite comandi vocali aperti mappati su comandi di sistema tramite LLM.

## Tecnologie utilizzate

Frontend (Marketplace): Vanilla JavaScript, Alpine.js

Frontend (Navigator): TypeScript, Vue.js

Backend & API: Node.js, Express, Passport (Auth)

Database: MongoDB

Styling / UI: Tailwind CSS, DaisyUI

Utility & AI: Zod (type validation), Purify (error handling), instructor-js (strutturazione output LLM)

## Come avviare l'applicazione

Controllare di avere Docker e Node.js o installarli se necessario.

Per creare il container Mongo:

```sh
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass -v mongodata:/data/db mongo
```

Successivamente, creare il file .env nella root del progetto:

```sh
#!/usr/bin/env bash
MONGO_USR=user
MONGO_PWD=pass
MONGO_SITE=localhost:27017
SESSION_SECRET=secret
```

Infine, eseguire il seguente comando npm:

```sh
npm run build:start
```

Andare sul browser al URL `https://localhost:8000` per utilizzare l'applicazione.
