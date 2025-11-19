# 🚀 How to Run the Neighborhood Marketplace Project

## Prerequisites

Make sure you have installed:
- **Node.js** (v14 or higher) - Download from https://nodejs.org/
- **npm** (comes with Node.js)
- **MongoDB** - Download from https://www.mongodb.com/try/download/community

## 📁 Project Structure

```
neighborhood-marketplace/
├── backend/          # Node.js/Express API Server
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
│
└── frontend/         # React + Vite Frontend
    ├── src/
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## 🎯 Step-by-Step Setup & Run Instructions

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

### Step 3: Create .env File in Backend

Create a `.env` file in the `backend` folder with the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/neighborhood-marketplace
JWT_SECRET=your_secret_key_here_change_this
NODE_ENV=development
```

### Step 4: Start MongoDB

If you have MongoDB installed locally:

**On Windows (PowerShell):**
```bash
mongod
```

Or if MongoDB is installed as a service, it should start automatically.

### Step 5: Start the Backend Server

From the `backend` directory, run:

```bash
npm start
```

You should see:
```
Backend running on port 5000
```

### Step 6: Open New Terminal - Navigate to Frontend

```bash
cd frontend
```

### Step 7: Install Frontend Dependencies

```bash
npm install
```

### Step 8: Start the Frontend Server

```bash
npm run dev
```

You should see output like:
```
Local:   http://localhost:5173/
```

### Step 9: Open in Browser

Open your browser and navigate to: **http://localhost:5173**

---

## ⚡ Quick Commands Reference

### Backend Commands

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the server (runs on port 5000)
npm start

# Check if running
curl http://localhost:5000/api/items
```

### Frontend Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build
```

---

## 🔧 Troubleshooting

### Issue: Backend won't start
- **Error: "Port 5000 already in use"**
  - Find and kill the process: `netstat -ano | findstr :5000`
  - Kill the process: `taskkill /PID <PID> /F`
  
- **Error: "MongoDB connection failed"**
  - Make sure MongoDB is running
  - Check connection string in .env file
  - Try: `mongosh` to test MongoDB connection

### Issue: Frontend won't start
- **Error: "Port 5173 already in use"**
  - Kill the process or use a different port
  - Edit `vite.config.js` to change the port

### Issue: CORS errors
- Make sure backend is running on `http://localhost:5000`
- Frontend should be on `http://localhost:5173`
- Check that CORS is enabled in backend

---

## ✨ Features Implemented

### 1. ✅ Wishlist Count in Navbar
- Wishlist count updates instantly when items are added/removed
- Shows correct count after login
- Displays (0) when logged out
- API endpoint: `GET /api/users/wishlist/count`

### 2. ✅ Profile Page - Save & Edit
- Edit profile fields (name, phone, city, address, role, business name, GST)
- Save functionality with PUT `/api/users/profile`
- Success toast notifications
- localStorage updates after save
- Role switching between Buyer and Seller
- Beautiful gradient styling

### 3. ✅ Improved Filters UI on Items Page
- Clean card design with white background
- Proper spacing and alignment
- Rounded corners and subtle shadows
- Full-width attractive buttons
- Icons next to labels
- Equal height filter panel
- Hover effects on inputs and buttons
- Responsive grid layout

### 4. ✅ UI/UX Enhancements
- Poppins font used throughout
- Modern gradient buttons
- Success/error toast notifications
- Loading states
- Responsive design for mobile/tablet/desktop
- Smooth animations and transitions
- Improved spacing and padding

---

## 📊 API Endpoints

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/wishlist/count` - Get wishlist count
- `GET /api/users/featured-item` - Get featured item

### Items
- `GET /api/items` - Get all items with filters
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item details

### User Actions
- `GET /user-actions/cart` - Get cart
- `POST /user-actions/cart` - Add to cart
- `DELETE /user-actions/cart/:itemId` - Remove from cart
- `GET /user-actions/wishlist` - Get wishlist
- `POST /user-actions/wishlist/:itemId` - Add to wishlist
- `DELETE /user-actions/wishlist/:itemId` - Remove from wishlist

---

## 📱 Testing Checklist

- [ ] Login/Register works
- [ ] Wishlist count updates in navbar
- [ ] Add/remove items from wishlist
- [ ] Edit profile and save
- [ ] Role switch works
- [ ] Filters on items page work
- [ ] Cart functionality works
- [ ] Toast notifications appear
- [ ] Responsive design on mobile

---

## 🎨 Default Ports

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **MongoDB**: mongodb://localhost:27017

---

## 📞 Support

If you encounter issues:
1. Make sure all dependencies are installed
2. Check that ports are not in use
3. Verify MongoDB is running
4. Check browser console for errors
5. Check backend server logs

---

## 🚀 Deployment Notes

When deploying:
1. Update API base URL in frontend
2. Set environment variables in production
3. Update MongoDB connection string
4. Set proper JWT_SECRET
5. Enable HTTPS
6. Update CORS origins

---

**Last Updated**: November 16, 2025
**Status**: ✅ All Features Implemented and Ready to Test
