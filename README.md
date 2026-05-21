# SyncTask Pro

Enterprise-level real-time collaborative task management — modern SaaS UI, offline-first sync, JWT auth, and Socket.IO live collaboration.

## Features

- **Authentication** — Sign up, login, logout, JWT cookies, refresh tokens, persistent sessions
- **Dashboard** — Live stats, status breakdown, recent activity feed
- **Kanban tasks** — Drag-and-drop, priorities, labels, due dates, search & filters
- **Real-time** — Instant task sync, presence, typing indicators, notifications (<500ms target)
- **Offline-first** — IndexedDB (Dexie), mutation queue, auto-sync on reconnect, conflict UI
- **Team** — Invite members, roles (owner/admin/member), online presence
- **Accessibility** — Semantic HTML, ARIA labels, keyboard focus, WCAG-oriented contrast
- **PWA** — Web manifest + service worker for cached shell

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite 8, Zustand, TanStack Query, Tailwind v4, Framer Motion, Socket.IO Client, Dexie |
| Backend | Node.js, Express 5, MongoDB/Mongoose, Socket.IO, JWT, Bcrypt, Helmet, Zod |
| Testing | Vitest, React Testing Library, Jest, Supertest |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB — **Docker** (easiest) or [MongoDB Atlas](https://www.mongodb.com/atlas)

### Start MongoDB (pick one)

**Option A — Local (Windows, already installed):**
```powershell
cd server
npm run db:start    # starts mongod using project data/ folder
npm run db:check    # verify connection
```

**Option B — Docker:**
```bash
docker compose up -d
```

**Option C — MongoDB Atlas:**  
Use a cloud connection string in `server/.env` as `MONGO_URI`.

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env if needed — JWT_SECRET, MONGO_URI
npm install
npm run dev
```

You should see:
```
Connecting to MongoDB...
MongoDB Connected: ...
✅ Server running in development mode on port 5000
```

If the server crashes, read the error message — common fixes:
- `Cannot connect to MongoDB` → start Docker (`docker compose up -d`) or fix `MONGO_URI`
- `Missing required environment variables` → copy `.env.example` to `.env`
- `Port 5000 is already in use` → stop the other process or set `PORT=5001` in `.env`

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173` (API proxied via Vite)

### Root scripts

```bash
npm run install:all   # install both packages
npm run dev:server
npm run dev:client
npm run build
npm run test
```

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/synctask-pro
JWT_SECRET=your_long_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For production, set `VITE_API_URL` to your deployed API (e.g. `https://api.example.com/api`).

## Offline Sync & Conflict Resolution

1. **Local writes** — Tasks are written to IndexedDB immediately (optimistic UI).
2. **Offline queue** — Mutations are stored in `syncQueue` when offline.
3. **Reconnect** — `syncEngine` replays the queue against the REST API.
4. **Versioning** — Each task has a `version` field incremented on save.
5. **Conflicts** — If client version < server version → `409` → **ConflictModal** lets users pick server or local copy.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register |
| POST | `/api/users/auth` | Login |
| POST | `/api/users/logout` | Logout |
| POST | `/api/users/refresh` | Refresh access token |
| GET | `/api/users/profile` | Current user (protected) |
| GET/POST | `/api/workspaces` | List / create workspaces |
| GET | `/api/tasks/workspace/:id` | Tasks (query: status, priority, search, sort) |
| GET | `/api/tasks/stats/:workspaceId` | Dashboard stats |
| POST/PUT/DELETE | `/api/tasks` | CRUD tasks |
| GET | `/api/notifications` | User notifications |
| POST | `/api/collaboration/invite` | Invite member |
| GET | `/api/collaboration/members/:id` | Team members |
| GET | `/api/collaboration/activity/:id` | Activity log |

## Testing

```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

## Deployment

- **Frontend** — Vercel/Netlify: root `client`, build `npm run build`, output `dist`. Set `VITE_API_URL`.
- **Backend** — Render/Railway: root `server`, start `npm start`. See `server/render.yaml`.
- **Database** — MongoDB Atlas connection string in `MONGO_URI`.

## Project Structure

```
Synctask_Pro/
├── client/src/
│   ├── components/   # UI, TaskCard, modals
│   ├── pages/        # Dashboard, Tasks, Team, Settings
│   ├── store/        # Zustand stores
│   ├── services/     # API layer
│   ├── sockets/      # Socket.IO client
│   └── offline/      # Dexie + sync engine
└── server/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── sockets/
    └── middleware/
```

## AI Disclosure

Parts of this application were architected and implemented with AI coding assistance to accelerate delivery while following production patterns for security, offline sync, and real-time collaboration.
