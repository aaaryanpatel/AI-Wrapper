# StudentMarket MVP (v1)

A React + Express MVP inspired by Facebook Marketplace, but restricted to Sask Polytech student emails.

## Features

- `@saskpolytech.ca` email gate for sign-in.
- Marketplace feed with sample data.
- Create listing (title, description, category, price).
- Comment on listings.
- Student-only global chat panel.

## Tech Stack

- Frontend: React + Vite
- Backend: Express (in-memory data store)

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Build

```bash
npm run build
```

## Notes

This is an MVP using in-memory storage. Data resets whenever the server restarts.
