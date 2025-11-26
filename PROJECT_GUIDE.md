# Neighborhood Marketplace — Project Guide

This single consolidated guide explains the repository layout, local setup, how to run the app (backend + frontend), environment variables, common developer workflows, and notes about validation and testing.

## Repository layout (top-level)
- `backend/` — Node.js + Express server, controllers, models, utils, scripts.
- `frontend/` — Vite + React app (JSX), API client, components, pages, styles.
- Root files — project README, configuration and small helper docs.

## Quick overview
- Purpose: A neighborhood marketplace with item/service listings, chat, bookings, and admin features.
- Tech: Node.js, Express, Socket.IO, MongoDB (Mongoose) on the backend; React (Vite) on the frontend; Axios for API calls.

## Environment & prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB or MongoDB Atlas connection string

Create a `.env` file in `backend/` with at least the following variables:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `PORT` — optional (default 5000)

Example `.env`:

```
MONGO_URI="mongodb://localhost:27017/neighborhood"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

## Install dependencies
1. Backend:

```
cd backend
npm install
```

2. Frontend:

```
cd frontend
npm install
```

## Run locally (development)
1. Start backend (from `backend/`):

```
cd backend
npm run dev   # or `npm start` depending on package.json scripts
```

If you see `EADDRINUSE` (port in use), either stop the process using that port or set `PORT` in `.env` to a free port.

2. Start frontend (from `frontend/`):

```
cd frontend
npm run dev
```

The frontend expects the backend API at `http://localhost:5000` by default; update `frontend/src/api/api.js` if you change the backend port.

## Creating an admin user / test data
- The `backend/scripts/` folder contains helper scripts such as `createTestAdminUser.js`. Run them (with `node`) after the backend is running and connected to the DB.

## Validation and UX notes
- Client-side validation lives in `frontend/src/utils/validation.js` and is intended to provide immediate feedback while typing.
- Server-side validation lives in `backend/utils/validation.js` and enforces rules for security and data integrity. Always trust server validation over client-side checks.
- Recent UX improvement: typing is blocked while a detected invalid/gibberish token exists in the title/description fields (frontend). This is checked via a heuristic function and prevents further text insertion until the invalid token is removed.

## Debugging common issues
- EADDRINUSE when starting backend: find and stop the process using the port (on Windows, use `netstat -ano | Select-String "5000"` to find PID, then `Stop-Process -Id <PID>` in PowerShell). Alternatively change the `PORT` env var.
- HTTP 500 on API requests: tail the backend logs/console while reproducing the request to see the stack trace. Look for missing `MONGO_URI`, DB connection errors, or unhandled exceptions in controllers.
- Repeated client network errors: unstable derivation of `user` or aggressive polling can cause many concurrent requests; `frontend/src/components/Navbar.jsx` contains the wishlist/chat polling logic — make `user` a stable state to avoid unnecessary effect runs.

## Testing
- Manual: create items/services through the UI and confirm server responses. Check browser console and backend logs.
- Automated: add tests under a `tests/` folder if desired. There are no CI tests included currently.

## Git & contributions
- Branching: create feature branches from `main` and open PRs for review.
- Commit messages: follow the repo's existing style (short type prefix, concise description).

## Where to look next in the code
- Frontend: `frontend/src/pages/ItemCreate.jsx`, `frontend/src/pages/ServiceCreate.jsx`, `frontend/src/utils/validation.js`, `frontend/src/api/api.js`.
- Backend: `backend/server.js`, `backend/controllers/`, `backend/utils/validation.js`, `backend/models/`.

## Contact / ownership
- Repository owner: `pooja032005` (local workspace owner).

---
If you'd like, I can now:
- start the backend and capture logs while reproducing the HTTP 500 error,
- run the frontend and demonstrate the live validation behavior,
- or open a PR with these documentation changes instead of pushing directly to `main`.

Tell me which of those you'd like next.
