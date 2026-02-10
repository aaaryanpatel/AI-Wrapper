# StudentMarket MVP (v1)

StudentMarket is a **student-only marketplace MVP** for Sask Polytech users.  
It is inspired by Facebook Marketplace workflows (feed + listing + comments), but locked to college email users for this first version.

---

## ✅ Does this project include an Express backend?

**Yes.** The backend is built with **Express.js** in `server/src/index.js`, and exposes REST APIs for:

- Login (email-domain restricted)
- Marketplace posts (list + create)
- Post comments (create)
- Student chat (list + send)

Reference files:
- `server/package.json`
- `server/src/index.js`
- `server/src/data.js`

---

## Features in V1

- `@saskpolytech.ca` email gate for access.
- Marketplace feed with starter sample data.
- Create listings with title, description, category, and price.
- Comment on listings.
- Global student chat channel.
- React frontend + Express backend in a workspace monorepo.

---

## Tech Stack

### Frontend
- React 18
- Vite 5

### Backend
- Node.js + Express 4
- CORS + JSON APIs
- In-memory storage for MVP data (no database yet)

### Monorepo Tooling
- npm workspaces
- concurrently (to run frontend/backend dev servers together)

---

## Project Structure

```text
.
├── client/                 # React app (Vite)
│   ├── src/
│   │   ├── components/     # UI components (login, feed, composer, chat)
│   │   ├── hooks/          # API client wrapper
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── server/                 # Express API
│   └── src/
│       ├── index.js        # Routes + app startup
│       └── data.js         # In-memory store + email-domain validation
├── package.json            # Workspace scripts
└── README.md
```

---

## Prerequisites

- **Node.js 18+** (recommended: Node 20 LTS)
- npm 9+

Check your versions:

```bash
node -v
npm -v
```

---

## Local Setup (Detailed)

### 1) Clone and enter the repo

```bash
git clone <your-repo-url>
cd AI-Wrapper
```

### 2) Install dependencies (root + workspaces)

```bash
npm install
```

### 3) Run both frontend and backend together

```bash
npm run dev
```

This starts:
- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:4000`

### 4) Open the app

Go to: `http://localhost:5173`

Use a Sask Polytech email such as:
- `demo.student@saskpolytech.ca`

Any non-`@saskpolytech.ca` email will be rejected in v1.

---

## Running Services Separately (Optional)

### Backend only

```bash
npm run dev --workspace server
```

### Frontend only

```bash
npm run dev --workspace client
```

---

## Build for Production

```bash
npm run build
```

This runs:
- `node --check` for backend syntax validation
- `vite build` for frontend production assets

---

## API Overview (Express)

Base URL: `http://localhost:4000`

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/login`
  - body: `{ "email": "...", "name": "..." }`
  - allows only `@saskpolytech.ca`

### Posts
- `GET /api/posts`
- `POST /api/posts`
  - body: `{ "sellerEmail", "title", "description", "price", "category" }`

### Comments
- `POST /api/posts/:postId/comments`
  - body: `{ "authorEmail", "message" }`

### Chat
- `GET /api/chat`
- `POST /api/chat`
  - body: `{ "authorEmail", "message" }`

---

## Current MVP Limitations

- Data is stored **in memory** and resets whenever backend restarts.
- No persistent authentication/session token yet.
- No real-time websocket chat yet (currently REST-based chat polling flow).
- No image upload/storage yet.

---

## Suggested Next Steps

- Add persistent database (PostgreSQL + Prisma).
- Add secure authentication (JWT/session + passwordless magic link or SSO).
- Add image uploads for listings.
- Add listing filters/search and pagination.
- Move chat to Socket.IO/WebSockets for real-time updates.

