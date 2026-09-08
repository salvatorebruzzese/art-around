# Art Around – Codebase Quick Reference

## 1. Project Structure

- **backend/**
  - Core Node.js+Express backend. Contains API routes, auth, business logic, Mongoose models, and service utilities.
- **marketplace/**
  - Desktop-first frontend for managing and browsing tours, items, museums, profiles, checkout; Vanilla JS/Alpine.js.
- **navigator/**
  - Mobile-first frontend for visitors and guides (real-time, LLM/voice commands, map).
- **access/**
  - User authentication (login/signup) frontend module.
- **home/**
  - Homepage frontend module.
- **scripts/**
  - Automation and data utilities (notably: `seed.js` for DB population).
- **docs/**
  - Architecture, API, and implementation documentation.
- **styles.css**, `tsconfig.json`, root `package.json`
  - Styles, TypeScript config, build/run/test scripts.

## 2. Technologies & Tooling

- **Frontend:**
  - Marketplace: Vanilla JS, Alpine.js, Tailwind CSS, DaisyUI
  - Navigator: TypeScript, Vue.js, Tailwind CSS
  - Module-based SPA's with Vite for builds
- **Backend:**
  - Node.js, Express, Passport (auth/session)
  - MongoDB (with Mongoose schemas/models)
  - Zod (runtime validation), Purify (error handling/monads)
- **Tooling/Automation:**
  - Docker (for MongoDB dev DB)
  - Scripts (JS): database seeding (`scripts/seed.js`)
  - Linting (ESLint, Prettier, lint-staged)
  - Vitest (testing)

## 3. Key Interfaces

### API (see `docs/API.md`)
- **RESTful endpoints, main root `/api`**
  - `/api/items` – CRUD, query/get/post/patch/delete items (artworks etc)
  - `/api/museums` – CRUD, get museums
  - `/api/tours` – CRUD, manage visits/tours
  - `/api/users` – User management (WIP)
  - `/api/assets` – Upload/fetch static assets
  - Auth: `/api/login`, `/api/signup`, `/api/logout`, `/api/profile`

  Most endpoints support authentication (Passport local/session), with public endpoints marked in doc.

### Entrypoints

- **Backend**
  - `/backend/index.ts`: Connects MongoDB and starts Express server (`app.ts`)
  - `/backend/app.ts`: Configures all main routers and middleware
  - `/backend/mainRouter.ts`: `/api` sub-router, wires up all entity-specific routers

- **Frontend**
  - Each frontend (marketplace, navigator, home, access) has its own entry (see `vite.config.js`, `router.ts`, `index.html`).

### Data Models/Schemas (Mongoose+TypeScript)

Examples:
- **Item** (`backend/item/model.ts`)
  ```ts
  interface IItem {
    name: string
    itemAuthor: ObjectId
    tour: ObjectId
    explanations: [{level: "simple"|"normal"|"advanced", text: string, durationSeconds: number}]
    tags?: string[]
    image?: ObjectId
    ...
  }
  ```
- **Tour** (`backend/tour/model.ts`)
  ```ts
  interface ITour {
    name: string
    author: ObjectId
    museum: ObjectId
    items: ObjectId[]
    price: number
    ...
  }
  ```
- **User** (`backend/user/model.ts`)
  ```ts
  interface IUser {
    username: string
    password: string
    email: string
    role: "User"|"Admin"
    purchasedTours: ObjectId[]
    ...
  }
  ```
- **Asset, Museum** – Similar schemas, see code for shape.

- **Permissions/Access Control**
  - Typed via string literal unions, e.g. `'edit:item'`, `'purchase:tour'`, exported as `Permission` type (`backend/accessControl.ts`).

## 4. Automation & Integration

- **Database seeding** (`scripts/seed.js`):
  - Wipes and repopulates all major collections (users, museums, tours, items, assets) for dev/testing.
  - Creates example users (admin, testuser), dummy assets, cross-references among models, uses faked artwork images.
  - Uses environment variables for MongoDB config.
  - Run via `node scripts/seed.js`, intended for dev setup/reset.

- **Build scripts** (see root `package.json`):
  - Build, start, and test all modules via npm scripts (`npm run build`, `npm run dbuild`, `npm run build:start`, etc).
- **Lint/format/test automation** with `lint-staged`, `eslint`, `prettier`, `vitest`.

---

## Agent Usage Tips

- To extend API: edit/create router/model/service files in `backend/`, expose via `mainRouter.ts`.
- To automate setup or refresh DB: modify/run `scripts/seed.js`.
- For new entities: define Mongoose schema/model, add router/service, wire in `mainRouter.ts`.
- To add frontend features: locate correct SPA module (`marketplace/`, `navigator/`, etc.), add pages/components and API integrations.
- Use `.env` for secrets/config; Docker command in README for MongoDB.

---

**References:**
- [README.md](~/Programmazione/uni/art-around/README.md)
- [API.md](~/Programmazione/uni/art-around/docs/API.md)
- Sample model files in `backend/`
- `scripts/seed.js` for automation hooks


## API Usage – In-Depth Technical Overview

### 1. Major API Endpoints

| Path                | Method | Summary                                 | Auth Required   |
|---------------------|--------|-----------------------------------------|-----------------|
| /api/items          | GET    | List items (id, name, tags)             | No              |
| /api/items/:id      | GET    | Get item details                        | Yes             |
| /api/items          | POST   | Create new item                         | Yes             |
| /api/items/:id      | PATCH  | Update item                             | Yes             |
| /api/items/:id      | DELETE | Delete item                             | Yes             |
| /api/museums        | GET    | List museums                            | No              |
| /api/museums/:id    | GET    | Get museum details                      | No              |
| /api/tours          | GET    | List all tours                          | No              |
| /api/tours/:id      | GET    | Get tour details                        | Yes             |
| /api/tours          | POST   | Create new tour                         | Yes             |
| /api/tours/:id      | PATCH  | Update tour                             | Yes             |
| /api/assets         | GET    | List/filter assets                      | No              |
| /api/assets/:id     | GET    | Get asset raw data                      | No              |
| /api/assets         | POST   | Upload new asset                        | Yes             |
| /api/users          | GET    | List users                              | Yes (admin)     |
| /api/users/:id      | GET    | Get user details                        | Yes             |
| /api/users          | PATCH  | Update user                             | Yes             |
| /api/users/:id      | DELETE | Delete user                             | Yes             |
| /api/signup         | POST   | Signup new user                         | No              |
| /api/login          | POST   | User login (session-based)              | No              |
| /api/logout         | POST   | End session                             | Yes             |
| /api/profile        | GET    | Get current user info                   | Yes             |

---

### 2. Typical JSON Requests & Responses

**Items**
- GET /items
  ```json
  [
    {"id":"abcd","name":"Mona Lisa","tags":["painting","renaissance"]}
  ]
  ```
- POST /items
  ```json
  {
    "name": "...",
    "itemAuthor": "ObjectId",
    "tour": "ObjectId",
    "explanations": [
      {"level": "simple", "text": "...", "durationSeconds": 60}
    ],
    "license": "...",
    "tags": ["tag1"],
    "image": "AssetId"
  }
  ```
  201 Response: Item object

**Museums**
- GET /museums
  ```json
  [
    { "id": "123", "name": "...", "thumbnail": "...", "description": "..." }
  ]
  ```
- GET /museums/:id
  - Full museum object

**Tours**
- GET /tours
  ```json
  [
    { "id": "abc", "name": "...", "author": "...", "thumbnail": "...", "description": "...", "price": 10 }
  ]
  ```
- POST /tours
  ```json
  {
    "name": "...",
    "author": "ObjectId",
    "museum": "ObjectId",
    "items": ["ObjectId1", "ObjectId2"],
    "price": 10,
    "thumbnail": "...",
    "description": "..."
  }
  ```

**Users**
- POST /signup
  ```json
  {
    "username": "user",
    "email": "user@email.com",
    "password": "..."
  }
  ```
- GET /users
  Returns: `[user, user, ...]` (admin required)

**Assets**
- POST /assets
  ```json
  {
    "author": "ObjectId",
    "tour": "ObjectId",
    "data": "...base64...",
    "datatype": "image/png",
    "public": true
  }
  ```
- GET /assets/:id
  - Response: Raw file

---

### 3. Authentication & Authorization

- Session-based authentication (Passport.js)
  - `/api/login` POST: returns session cookie (`connect.sid`)
  - Required for all POST/PATCH/DELETE endpoints and `/profile`, `/users`
- Authorization rules per endpoint, e.g.:
  | Action         | Visitor | User | Creator | Guide | Admin |
  |---------------|---------|------|---------|-------|-------|
  | View museum   | ✓       | ✓    | ✓       | ✓     | ✓     |
  | Edit/delete   |         |      | ✓       |       | ✓     |
- Additional logic (e.g. must be author/owner to edit/delete own items)

---

### 4. Error/Validation Handling

- Input validated with Zod schemas; invalid input returns:
  ```json
  { "error": { "message": "...", "issues": [ ... ] } }
  ```
- Error status codes:
  - 400: Validation
  - 401: Not logged in
  - 403: Forbidden (role/ownership)
  - 404: Not found
  - 409: Conflict
  - 500: Server error
- Error fields: always `{ "error": ... }` or `{ "message": ... }`

---

### 5. Filtering & Query Features

- Most list endpoints accept filter params, e.g.:
  - `/api/items?name=Mona+Lisa&tags=painting`
- Filters are Zod-typed in code (see `*Query` schemas)
- Sorting/pagination: not present by default; filtering supports partial text matches

---

### 6. Other API Characteristics

- CORS: enabled globally (any origin allowed)
- No explicit rate limiting or API versioning present

---

#### Copy-paste Reference

Example: GET /api/items

Request:
GET /api/items?name=Mona&tags=painting

Response 200:
```json
[
  {
    "id": "xxx",
    "name": "Mona Lisa",
    "tags": ["painting"]
  }
]
```

---

For further extension, see Zod schema files and backend router/service implementations for valid fields and endpoint logic.

# Session (guided tours)
Guided tours are tours orchestrated by the teacher who will choose what item to display. At the end of the tour the teacher can prompt a series of quizzes (multiple choice, time constrained) to evaulate the pupil retention of the tour. 
The tour is prepared by the teacher through an editor. The quiz is always at the end.
The backend can only use a server generated events. (Keepalive https etc.)

## 1. **Session/Guided Tour Lifecycle**

-   **Tour Preparation (by Teacher):**
    -   Tour created/edited, items selected, quiz questions prepared/attached.
    -   Store quiz at the end of the tour definition.
-   **Session Start:**
    -   Teacher creates a “live session” for a given tour (generates a session, similar to your sessions array).
    -   Unique session ID, owner is teacher, state is `INIT`.
-   **Pupil Join:**
    -   Pupil connects to `/session/:id` (SSE). Added to session’s client list.
-   **Tour Orchestration:**
    -   Teacher “commands” progression via POSTs: e.g., “show item X” → backend relays event to all SSE clients.
    -   Teacher can see current session status (connected pupils, progress).
-   **Quiz Trigger:**
    -   At tour end, teacher POSTs a “start quiz” command.
    -   Quiz is sent via SSE to all pupils.
-   **Quiz Handling:**
    -   Pupils respond via POST to `/sessions/:id/quiz`.
    -   Backend validates time, records answers per pupil.
    -   When time elapses or all submit, backend sends SSE “quiz ended” event and can release results.

## 2. **Backend Changes**

**Data Models:**

-   Extend Session object:
    -   Track `currentStep` (item id or `quiz`), `quizInProgress` (bool), quiz start time, submitted answers {[clientId]: answer}
-   Quiz: array of questions (store in Tour model), each with options, correct answer, time, etc.

**Routes:**

-   `POST /sessions/` (create session)
-   `GET /session/:id` (connect SSE)
-   `POST /sessions/:id` (commands: show item, start quiz, status)
-   `POST /sessions/:id/quiz` (pupil answer submit)

**SSE Events:**

-   Event types: `showItem`, `quizStart`, `quizUpdate` (optional), `quizEnd`, `sessionStatus`, `endTour`.

**Session Timeout:**

-   If no teacher action or all pupils DC, session times out as now.


## 3. **Quiz Flow**

-   Teacher: POST `/sessions/:id` with `{ type: 'startQuiz' }`.
-   Backend: checks session state, sends `quizStart` SSE event to all pupils with quiz payload (questions/options, timer start).
-   Pupil: POST `/sessions/:id/quiz` with answer.
-   Backend: validates timing, stores answer.
-   After time or all responses: backend scores, sends results via SSE (`quizEnd=/=quizResults`).




## 4. **Security & Correctness**

-   Only session owner (teacher) can control tour/quiz progression.
-   Only pupils in client list can submit answers.
-   Answers after quiz ended/time up are rejected with error.
-   Timers processed server-side (prevent cheating).




## 5. **Frontend/UX (not backend, but relevant)**

-   Pupil UI listens to SSE events, updates display (current item, quiz prompt, timer, results).
-   Teacher UI: see live status (who’s connected, answers in), control flow (step, launch quiz, see results).




## 6. **Open Questions / Weak Spots**

-   How are pupil identities managed? (Anon token, login requirement)
-   Do you need to support reconnect for SSE after network blip?
-   Should answers be per-question POST or all-at-once? (Recommend all-at-once for atomicity)
-   Is the quiz single or multi-question? (Affects answer payload and event design)




## Minimal “Critical Path”\*

1.  **Extend session struct**: current step (item/quiz), quiz details, answers
2.  **Implement teacher commands**: show item, start quiz, send to all clients via SSE
3.  **Quiz receive**: single POST route for answers, server-side time check
4.  **Quiz results**: broadcast to all after time/answers in
5.  **Session cleanup/timeout**
6.  **(Optional) Real status events, error handling**


This fits your current direction, leverages SSE as required, and ensures that only the backend coordinates all real-time and quiz events.  
If you want a precise model/route sketch or code skeleton, ask next.



## FAQ

-   How are pupil identities managed? (Anon token, login requirement)
    We could create a temporary user to be set in the db, owning the administered tour, without having to modify further the CRUD logic.

-   Do you need to support reconnect for SSE after network blip?
    This is very optional, it will be the very last thing to do.

-   Should answers be per-question POST or all-at-once? (Recommend all-at-once for atomicity)
    Since the quiz is at the end we can do an all-at-once

-   Is the quiz single or multi-question? (Affects answer payload and event design)
    Multi-question, timed, with mulitple choices

