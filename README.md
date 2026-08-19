# NeighbourhoodMarket

NeighbourhoodMarket is a React + Vite marketplace with an Express, MongoDB, and Socket.IO backend. It supports local products, services, buyer and seller accounts, administrator management, cart and wishlist workflows, orders, notifications, and real-time marketplace conversations.

## Project Structure

- `frontend/` - React + Vite application
- `backend/` - Express API, MongoDB models, authentication, uploads, and Socket.IO
- `backend/routes/` - API route modules
- `backend/models/` - Mongoose models
- `frontend/src/pages/` - Marketplace pages and authentication screens

## Local Setup

Install dependencies in both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Configure `backend/.env` with the local MongoDB connection and JWT settings required by the backend. Start the applications in separate terminals:

```bash
cd backend
npm start

cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on port `5000` by default.

## Current Features

- Marketplace browsing for products and services
- Category navigation, search, cart, wishlist, checkout, and orders
- Buyer, seller, and administrator authentication flows
- Admin dashboard and management tools
- Seller dashboard and listing management
- Chat conversations with message persistence, media uploads, polling, and Socket.IO support
- Responsive marketplace layouts for desktop, tablet, and mobile screens
- Premium NeighbourhoodMarket Admin Login, Messages, and homepage layouts

## Validation

Build the production frontend with:

```bash
cd frontend
npm run build
```
