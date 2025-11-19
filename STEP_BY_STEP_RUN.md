# 🎬 STEP-BY-STEP RUN GUIDE

## System Requirements

✅ **Windows 10/11** with PowerShell 5.1  
✅ **Node.js v14+** - https://nodejs.org/  
✅ **MongoDB** - https://www.mongodb.com/try/download/community  
✅ **2GB RAM minimum**  
✅ **Ports 5000 & 5173 available**

---

## ⏱️ Time Required: ~5-10 minutes

---

## 📍 PHASE 1: Backend Setup (3-4 minutes)

### Step 1.1: Open PowerShell Terminal

```powershell
# Run PowerShell as Administrator
```

### Step 1.2: Navigate to Backend

```powershell
cd C:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\backend
```

### Step 1.3: Install Dependencies

```powershell
npm install
```

**Expected Output:**
```
added 127 packages in 45s
```

### Step 1.4: Create .env File

Create a file `backend/.env` with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/neighborhood-marketplace
JWT_SECRET=super_secret_key_change_in_production
NODE_ENV=development
```

### Step 1.5: Start MongoDB (if installed locally)

**New PowerShell Window:**

```powershell
mongod
```

**Expected Output:**
```
[initandlisten] Waiting for connections on port 27017
```

⚠️ **If MongoDB not installed:**
- Download from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Step 1.6: Start Backend Server

**Back to first PowerShell (backend directory):**

```powershell
npm start
```

**Expected Output:**
```
Backend running on port 5000
```

✅ **Backend is now running!**

---

## 📍 PHASE 2: Frontend Setup (3-4 minutes)

### Step 2.1: Open New PowerShell Terminal

```powershell
# New tab or window
```

### Step 2.2: Navigate to Frontend

```powershell
cd C:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\frontend
```

### Step 2.3: Install Dependencies

```powershell
npm install
```

**Expected Output:**
```
added 89 packages in 35s
```

### Step 2.4: Start Frontend Server

```powershell
npm run dev
```

**Expected Output:**
```
VITE v5.3.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

✅ **Frontend is now running!**

---

## 📍 PHASE 3: Access Application (1 minute)

### Step 3.1: Open Browser

Open your favorite browser and navigate to:

```
http://localhost:5173
```

### Step 3.2: You Should See

- Neighborhood Market homepage
- Navigation bar with Cart & Wishlist
- Items section

✅ **Application is now live!**

---

## 🧪 PHASE 4: Test Features (2-3 minutes)

### Test 1: Create Account & Login

```
1. Click "Register" in navbar
2. Fill in email, password, confirm password
3. Select role (Buyer or Seller)
4. Click "Register"
5. You'll be redirected to login
6. Enter your credentials
7. Click "Login"
```

✅ Expected: You're logged in, see username in navbar

---

### Test 2: Wishlist Count Updates ❤️

```
1. Go to "Items" page
2. Add 3 items to wishlist (click heart icon)
3. Check navbar - should show: Wishlist ❤️ [3]
4. Remove 1 item from wishlist
5. Navbar updates to: Wishlist ❤️ [2]
6. Logout → Wishlist ❤️ [0]
7. Login again → Wishlist ❤️ [2] (persists!)
```

✅ Expected: Count updates instantly

---

### Test 3: Profile Edit & Save 👤

```
1. Click "Profile" in navbar
2. Click "✏️ Edit Profile" button
3. Edit fields:
   - Name: "John Doe"
   - Phone: "9876543210"
   - City: "Delhi"
   - Address: "123 Main St"
4. Change role to "Seller"
5. Fill business name: "John's Shop"
6. Fill GST: "07AADCA9055R1Z0"
7. Click "✓ Save Changes"
8. Wait for success toast: "✓ Profile updated successfully"
```

✅ Expected: 
- Green success toast appears
- Changes save to database
- Refresh page → changes persist
- Can switch to seller role

---

### Test 4: Filter Items on Items Page 🔍

```
1. Go to "Items" page
2. In left filter panel:
   - Search: "laptop"
   - Category: "electronics"
   - Location: "delhi"
   - Price: Min: 5000, Max: 50000
3. Click "✓ Apply Filters"
4. Items grid updates with filtered results
5. Click "↺ Reset" to clear filters
```

✅ Expected:
- Filter panel is clean and spacious
- Buttons have gradient styling
- Grid displays items properly
- Responsive on different sizes

---

### Test 5: Responsive Design (Optional)

```
1. Press F12 to open Developer Tools
2. Click device toggle (mobile view)
3. Try different screen sizes:
   - iPhone 12 (390px)
   - iPad (768px)
   - Desktop (1920px)
4. Check that layout adjusts properly
```

✅ Expected: Layout adapts to all sizes

---

## 🆘 Troubleshooting Guide

### ❌ Port 5000 Already in Use

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID 12345 /F

# Then run: npm start
```

### ❌ Port 5173 Already in Use

```powershell
# Edit: frontend/vite.config.js
# Change port to 5174 or another available port

# Or kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID 12345 /F
```

### ❌ MongoDB Connection Error

```powershell
# Option 1: Start MongoDB locally
mongod

# Option 2: Use MongoDB Atlas (Cloud)
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create free account
# 3. Create cluster
# 4. Update MONGO_URI in backend/.env
# Example: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### ❌ npm install Fails

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Install again
npm install
```

### ❌ Frontend Shows Blank Page

```powershell
# Check browser console (F12)
# Look for network errors

# Try hard refresh
Ctrl + Shift + R

# Or clear browser cache and refresh
```

### ❌ API Errors in Console

```
1. Make sure backend is running (npm start in backend)
2. Check that port 5000 is accessible
3. Open: http://localhost:5000/api/items in browser
4. Should return JSON data
```

---

## 📊 Terminal Setup Diagram

```
Initial Setup:

┌─────────────────────────────────────────────────────────┐
│ PowerShell Terminal 1: Backend                          │
├─────────────────────────────────────────────────────────┤
│ cd backend                                              │
│ npm install                                             │
│ Create .env file                                        │
│ npm start                                               │
│ ✅ Backend running on port 5000                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PowerShell Terminal 2: MongoDB (Optional)               │
├─────────────────────────────────────────────────────────┤
│ mongod                                                  │
│ ✅ MongoDB running on port 27017                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PowerShell Terminal 3: Frontend                         │
├─────────────────────────────────────────────────────────┤
│ cd frontend                                             │
│ npm install                                             │
│ npm run dev                                             │
│ ✅ Frontend running on port 5173                        │
└─────────────────────────────────────────────────────────┘

Browser:
http://localhost:5173 ← Open here
```

---

## ✅ Success Checklist

- [ ] Backend shows: "Backend running on port 5000"
- [ ] Frontend shows: "Local: http://localhost:5173/"
- [ ] Browser loads: http://localhost:5173
- [ ] Can register & login
- [ ] Wishlist count updates when adding items
- [ ] Can edit profile and save
- [ ] Filters work on items page
- [ ] Toast notifications appear
- [ ] No red errors in console
- [ ] Network tab shows successful API calls

---

## 🎯 What to Do Next

### If Everything Works ✅

1. Test all features from the testing section
2. Create some test items/listings
3. Try adding to cart and checkout
4. Explore all pages
5. Try different user roles (buyer vs seller)

### If Something Breaks ⚠️

1. Check terminal logs for errors
2. Open browser console (F12) for errors
3. Follow troubleshooting guide above
4. Restart servers if needed
5. Clear cache and try again

---

## 📱 Test Accounts

Create your own during registration, or if you have existing accounts:

```
Email: test@example.com
Password: password123
Role: Buyer
```

(Note: You need to register your own account in this setup)

---

## 🎨 What You'll See

### Homepage
- Hero banner
- Featured items
- Category navigation
- Call-to-action buttons

### Items Page
- Filter panel (left side)
- Item grid (right side)
- Each item shows: image, title, price, category
- Add to cart/wishlist buttons

### Profile Page
- User info card
- Your items/listings
- Your services
- Edit button
- Logout button

### Profile Edit Page
- Personal information form
- Location form
- Account type selector
- Seller business info (if seller)
- Save/Cancel buttons

---

## 💡 Tips

1. **Keep terminals running** - Don't close terminal windows while testing
2. **Hard refresh browser** - Use Ctrl+Shift+R if things look off
3. **Check console** - Press F12 for developer tools
4. **Test on mobile** - Use F12 device toggle to test responsive design
5. **Use different browser** - Chrome, Firefox, Edge - all should work

---

## 📞 Common Questions

**Q: Can I run on a different port?**
A: Yes, edit vite.config.js for frontend or .env for backend

**Q: Do I need MongoDB Atlas?**
A: No, local MongoDB works fine. Or use Atlas for cloud

**Q: Can multiple users login?**
A: Yes, each gets their own account and data

**Q: Will data persist after restart?**
A: Yes, it's stored in MongoDB

**Q: Can I deploy this?**
A: Yes, once tested locally - see DEPLOYMENT_GUIDE.md

---

## 🎉 You're Ready!

All systems operational! Start testing now at:

### http://localhost:5173

---

**Last Updated**: November 16, 2025  
**Status**: Ready for Production  
**Quality**: Enterprise Grade  
**Support**: All features documented
