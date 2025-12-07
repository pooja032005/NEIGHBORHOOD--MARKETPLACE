Development Quick Start

Start backend and frontend servers (PowerShell):

Backend (existing):

```powershell
cd "c:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\backend"
npm install
npm run dev
```

Frontend (Vite) — port set to 5174:

```powershell
cd "c:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\frontend"
npm install
npm run dev
# Open http://localhost:5174
```

Notes:
- Backend API: http://localhost:5000/api
- Frontend dev server: http://localhost:5174/
- If you previously opened http://localhost:5174 and saw connection errors, make sure both servers are running and refresh the page (Ctrl+F5).

Troubleshooting:
- If the frontend starts on a different port, ensure `frontend/vite.config.js` has `server.port: 5174`.
- If API calls fail with 401/403, ensure you're logged-in as a Seller (see `SELLER_SETUP_GUIDE.md`).
- If API returns 404 for a seller route, ensure backend is running and the `backend/routes/seller.js` file is present and `app.use('/api/seller', sellerRoutes);` is in `backend/server.js`.

To upgrade an existing buyer account to seller:

```powershell
cd "c:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\backend"
node scripts/makeUserSeller.js <userId-or-email>
```

