Neighborhood Marketplace — Project Guide

Overview

This repository contains a Neighborhood Marketplace application (backend + frontend) built with Node.js/Express, MongoDB (Mongoose) and a React (Vite) frontend. The project supports items and services listing, user roles (buyer/seller/admin), chat, wishlists, and admin statistics.

This single, concise guide explains how to run, test, and maintain the app.

Quick Start (Development)

1. Requirements
   - Node.js (v18+ recommended)
   - npm
   - MongoDB instance (local or hosted)

2. Backend
   - Path: `backend/`
   - Install dependencies:

```powershell
cd backend
npm install
```

   - Configure environment variables: create a `.env` file (see `.env.example` if present) with at least:
     - `MONGO_URI` — MongoDB connection string
     - `JWT_SECRET` — JWT signing secret
     - `PORT` — (optional) backend port (defaults to 5000)

   - Start backend server:

```powershell
cd backend
npm start
```

   - If port 5000 is already in use, stop the process occupying it or change `PORT` in `.env`.

3. Frontend
   - Path: `frontend/`
   - Install dependencies:

```powershell
cd frontend
npm install
```

   - Start dev server:

```powershell
cd frontend
npm run dev
```

   - Frontend communicates with backend at `http://localhost:5000/api` by default. See `frontend/src/api/api.js` to adjust baseURL.

Validation & Data Quality

- Client + server validation is used for titles, descriptions, categories, and image URLs.
- The frontend contains real-time validation to prevent gibberish product titles/descriptions before submission; the server enforces the same checks as a final gate.
- Category values are canonical: `Electronics`, `Home Goods`, `Fashion`, `Games`, `Books`, `Sports`, `Others`.

Common Commands

- Start backend: `cd backend; npm start`
- Start frontend: `cd frontend; npm run dev`
- Run one-off scripts (examples in `backend/scripts/`): `node backend/scripts/makeUserSeller.js --email you@example.com`

Troubleshooting

- ERR_INSUFFICIENT_RESOURCES / Network errors in frontend console:
  - Ensure backend is running on expected port (default 5000).
  - Check for multiple Node processes using the port (Windows PowerShell):

```powershell
netstat -ano | Select-String ":5000"
Get-Process -Id <PID> -ErrorAction SilentlyContinue
```
  - Kill stray node processes if necessary and restart backend.

- POST /api/items/create returns 500:
  - Check backend console for error logs. The backend returns error message in response JSON under `error` key.
  - Ensure the request contains required fields (title, description, category) and a valid auth token.

- Git workflow:
  - Commit locally: `git add -A; git commit -m "msg"`
  - Push: `git push origin main`

Project Structure (high level)

- backend/
  - server.js — HTTP + Socket.IO server
  - controllers/ — request handlers
  - models/ — Mongoose schemas
  - routes/ — Express routes
  - utils/ — validation, auth middleware, view tracking
  - scripts/ — maintenance scripts (makeUserSeller, normalize categories, etc.)

- frontend/
  - src/ — React app
  - src/pages — major pages (ItemCreate, ServiceCreate, Home, Admin)
  - src/components — shared components (Navbar, Chat, etc.)
  - src/utils — frontend validation utilities
  - src/api/api.js — axios client baseURL

Testing

- Manual: Follow flows in the app: create item/service as seller, verify validation, check admin stats.
- API: Use Postman or curl to call the backend endpoints. Include `Authorization: Bearer <token>` header for protected routes.

Notes

- This guide intentionally replaces multiple generated documentation files with a single reference file. Code has not been modified by this guide.
- If you want a more detailed breakdown (diagrams or step-by-step tests), tell me which area to expand and I will add it as a separate file.

Contact

- Repo owner: GitHub user `pooja032005` (the repo remote is already configured).

---

End of guide.
