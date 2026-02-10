# StudentMarket V1+ (Responsive + MongoDB + DMs)

StudentMarket is a student-only marketplace for Sask Polytech users.

## What's New

- Fully responsive and modern UI.
- Express.js backend with MongoDB (Mongoose).
- JWT-based login sessions.
- Marketplace feed with likes, comments, and search.
- Instagram-style direct messages between students.
- Settings page (profile, notifications, status) and logout.

## Tech Stack

- Frontend: React + Vite
- Backend: Express + Mongoose
- Database: MongoDB
- Auth: JSON Web Tokens

## Project Structure

- `client/` React app
- `server/` Express API + Mongoose models

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally or remotely

## Environment Variables

Create `server/.env` (or export env vars in shell):

```bash
MONGO_URI=mongodb://127.0.0.1:27017/studentmarket
JWT_SECRET=change-this-secret
PORT=4000
```

## Setup & Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB (if local):

```bash
mongod
```

3. Start frontend + backend together:

```bash
npm run dev
```

4. Open app:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

Use only `@saskpolytech.ca` email for login.

## Run Services Separately

Backend only:

```bash
npm run dev --workspace server
```

Frontend only:

```bash
npm run dev --workspace client
```

## Build

```bash
npm run build
```

## API Highlights

- `POST /api/auth/login` (returns JWT)
- `POST /api/auth/logout`
- `GET /api/me`
- `GET/POST /api/posts`
- `PUT /api/posts/:postId/like`
- `POST /api/posts/:postId/comments`
- `GET /api/users`
- `GET/POST /api/messages/conversations`
- `GET/POST /api/messages/conversations/:conversationId`
- `GET/PUT /api/settings`

## Notes

- MongoDB is required for runtime.
- A sample listing is auto-seeded on first boot.
- This is still MVP-grade and can be extended with image uploads and real-time sockets.
