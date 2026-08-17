[English](README.md) | [Italiano](README.it.md)

# Art around

A full-stack and responsive web application to manage museum visits, developed as a project for the Web Technologies course A.Y. 2025/2026 of the University of Bologna.

## Architecture and Modules

The system adopts an approach based on goal-oriented design and is divided into two main modules:

- Marketplace: Desktop-first platform for creating, viewing, editing, and distributing visits.

- Navigator: Mobile-first web-app for the end user and guides (real-time synchronization). It offers a view of the museum map, reading with speech synthesis, and interaction via voice commands mapped to system commands through LLM.

## Technologies used

Frontend (Marketplace): Vanilla JavaScript, Alpine.js

Frontend (Navigator): TypeScript, Vue.js

Backend & API: Node.js, Express, Passport (Auth)

Database: MongoDB

Styling / UI: Tailwind CSS, DaisyUI

Utility & AI: Zod (type validation), Purify (error handling)

## How to start the application

Check that you have Docker and Node.js or install them if necessary.

To create the Mongo container:

```sh
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass -v mongodata:/data/db mongo
```

Subsequently, create the .env file in the root of the project:

```sh
#!/usr/bin/env bash
MONGO_USR=user
MONGO_PWD=pass
MONGO_SITE=localhost:27017
SESSION_SECRET=secret
```

Finally, execute the following npm command:

```sh
npm run build:start
```

Go to the browser at the URL `https://localhost:8000` to use the application.
