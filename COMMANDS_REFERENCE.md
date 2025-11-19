# ⚡ ALL COMMANDS IN ONE PLACE

## Copy-Paste Ready Commands

---

## 🚀 BACKEND SETUP & RUN

### Open PowerShell as Administrator

```powershell
# Step 1: Go to backend folder
cd C:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\backend

# Step 2: Install dependencies (first time only)
npm install

# Step 3: Create .env file with this content:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/neighborhood-marketplace
# JWT_SECRET=super_secret_key_change_in_production
# NODE_ENV=development

# Step 4: Start MongoDB (in separate PowerShell window)
mongod

# Step 5: Start backend server
npm start
```

**Expected Output:**
```
Backend running on port 5000
```

---

## 🎨 FRONTEND SETUP & RUN

### Open PowerShell (New Window/Tab)

```powershell
# Step 1: Go to frontend folder
cd C:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\frontend

# Step 2: Install dependencies (first time only)
npm install

# Step 3: Start frontend development server
npm run dev
```

**Expected Output:**
```
Local:   http://localhost:5173/
```

---

## 🌐 OPEN IN BROWSER

```
http://localhost:5173
```

---

## 🆘 TROUBLESHOOTING COMMANDS

### Port 5000 Already in Use

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

### Port 5173 Already in Use

```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill process (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

### MongoDB Connection Error

```powershell
# Start MongoDB
mongod

# Or check if MongoDB is running
netstat -ano | findstr :27017
```

### Clear npm Cache

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
Remove-Item -Recurse -Force node_modules

# Delete package-lock.json
Remove-Item package-lock.json

# Reinstall
npm install
```

### Reset Everything

```powershell
# In backend folder
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm start

# In frontend folder (new window)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

---

## 🧪 TEST COMMANDS

### Test Backend API

```powershell
# In any PowerShell window, test if backend is running
curl http://localhost:5000/api/items

# Should return JSON data
```

### Check MongoDB

```powershell
# Connect to MongoDB shell
mongosh

# List databases
show databases

# Switch to your database
use neighborhood-marketplace

# See collections
show collections

# Exit
exit
```

---

## 📦 BUILD FOR PRODUCTION

### Frontend Build

```powershell
cd frontend

# Create production build
npm run build

# Output will be in 'dist' folder
```

---

## 🗑️ CLEAN UP COMMANDS

### Remove Installed Dependencies

```powershell
# In backend folder
Remove-Item -Recurse -Force node_modules

# In frontend folder
Remove-Item -Recurse -Force node_modules
```

### Remove Cache Files

```powershell
# Clear npm cache globally
npm cache clean --force

# Delete package lock files
cd backend
Remove-Item package-lock.json

cd ../frontend
Remove-Item package-lock.json
```

---

## 📊 CHECK STATUS

### Check if Ports are in Use

```powershell
# Check all ports in use
netstat -ano

# Check specific port
netstat -ano | findstr :5000
netstat -ano | findstr :5173
netstat -ano | findstr :27017
```

### Check Node Version

```powershell
node --version
npm --version
```

### Check MongoDB Version

```powershell
mongod --version
```

---

## 🎯 QUICK REFERENCE

### 3-Terminal Setup (Recommended)

```
Terminal 1: MongoDB
────────────────────
mongod

Terminal 2: Backend
────────────────────
cd backend
npm start

Terminal 3: Frontend
────────────────────
cd frontend
npm run dev

Then open browser:
http://localhost:5173
```

---

## 📝 CREATE .env FILE

### Windows PowerShell - Create .env in backend

```powershell
cd backend

# Create the file
New-Item -Name ".env" -ItemType File

# Open in Notepad to edit
notepad .env
```

### Add this content to .env:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/neighborhood-marketplace
JWT_SECRET=super_secret_key_change_in_production
NODE_ENV=development
```

Save and close.

---

## 🔄 RESTART SERVERS

### Kill All Node Processes

```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force
```

### Restart Backend

```powershell
# Stop: Press Ctrl+C in backend terminal
# Then run:
npm start
```

### Restart Frontend

```powershell
# Stop: Press Ctrl+C in frontend terminal
# Then run:
npm run dev
```

---

## 🌍 ENVIRONMENT VARIABLES

### Update Backend Port

Edit `backend/.env`:
```
PORT=3000  # Changed from 5000
```

### Update Frontend API URL

If deploying backend elsewhere, update `frontend/src/api/api.js`:
```javascript
const client = axios.create({
  baseURL: "http://your-backend-url:port/api",
});
```

---

## 📱 TEST ON MOBILE

### Get Local IP Address

```powershell
# Get your machine IP
ipconfig

# Look for "IPv4 Address" (usually 192.168.x.x)
```

### Open from Mobile

Open browser on mobile phone and go to:
```
http://<your-ip>:5173
```

Example:
```
http://192.168.1.100:5173
```

---

## 🚀 DEPLOYMENT COMMANDS

### Build Frontend

```powershell
cd frontend
npm run build
```

### Verify Build

```powershell
npm run preview
```

---

## 📋 FULL WORKFLOW

```powershell
# 1. Setup Backend
cd backend
npm install
npm start

# 2. Setup Frontend (new terminal)
cd frontend
npm install
npm run dev

# 3. Open Browser
http://localhost:5173

# 4. Test Features
# - Register/Login
# - Add items to wishlist (check navbar count)
# - Edit profile and save
# - Use filters on items page

# 5. When done - Stop servers
# Press Ctrl+C in both terminals

# 6. To run again
# Just run "npm start" and "npm run dev" again
```

---

## ✅ SUCCESS INDICATORS

You'll see:

```
Backend Terminal:
✅ Backend running on port 5000

Frontend Terminal:
✅ Local: http://localhost:5173/

Browser:
✅ Page loads without errors
✅ Can navigate all pages
✅ Toast notifications appear
✅ Wishlist count updates
✅ Profile saves successfully
```

---

## 🎉 You're All Set!

### Remember:
1. Keep terminals open while working
2. Backend must run on port 5000
3. Frontend must run on port 5173
4. MongoDB must be running (if using local)
5. Use Ctrl+C to stop servers

### Files to Know:
- Backend start: `backend/server.js`
- Frontend start: `frontend/src/main.jsx`
- Backend routes: `backend/routes/`
- Frontend components: `frontend/src/components/`

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| MongoDB | mongodb://localhost:27017 |
| GitHub (if deployed) | Your repo URL |

---

**Ready to start? Run Terminal Setup above! 🚀**

For more details, see:
- STEP_BY_STEP_RUN.md (detailed guide)
- RUN_COMMANDS.md (comprehensive guide)
- QUICK_START.txt (5-step quick start)
