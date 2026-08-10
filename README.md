[English](README.md) | [Italiano](README.it.md)

# Art around

A full-stack, responsive web application for managing museum visits, developed as a project for the Web Technologies course (A.Y. 2025/2026) at the University of Bologna.

## Architecture and Modules

The system adopts a goal-oriented design approach and is divided into two main modules:

- **Marketplace**: A desktop-first platform for creating, editing (with LLM support for tour generation), and publishing visits.
- **Navigator**: A mobile-first web app for end-users and guides (featuring real-time synchronization). It offers indoor geolocation, text-to-speech capabilities, and interaction via open-vocabulary voice commands mapped to system commands through an LLM.

## Tech Stack

- **Frontend (Marketplace)**: Vanilla JavaScript, Alpine.js
- **Frontend (Navigator)**: TypeScript, Vue.js
- **Backend & API**: Node.js, Express, Passport (Auth)
- **Database**: MongoDB
- **Styling / UI**: Tailwind CSS, DaisyUI
- **Utilities & AI**: Zod (runtime type validation), Purify (functional error handling), instructor-js (LLM structured output extraction)

## How to Start the Application

Ensure Docker and Node.js are installed on your host machine.

To provision the MongoDB container:

```sh
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass -v mongodata:/data/db mongo
```

Next, create the `.env` file in the project root:

```env
MONGO_USR=user
MONGO_PWD=pass
MONGO_SITE=localhost:27017
SESSION_SECRET=secret
```

Finally, execute the build and start script:

```sh
npm run build:start
```

Navigate to `https://localhost:8000` in your browser to access the application.
