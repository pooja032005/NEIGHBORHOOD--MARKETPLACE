# 🗑️ How to Clear User Data

## Quick Commands

### Option 1: Clear Only Users (Recommended)
```powershell
cd backend
node scripts/clearUsers.js
```

**Output:**
```
✅ Connected to MongoDB
📊 Current users in database: 1
✅ Successfully deleted 1 users!
✨ Database cleared! Ready to register new users.
```

---

### Option 2: Clear ALL Data (Complete Wipe)
```powershell
cd backend
node scripts/clearAllData.js
```

**What it clears:**
- ✅ Users
- ✅ Items
- ✅ Orders
- ✅ Bookings
- ✅ Services
- ✅ Messages
- ✅ Addresses

---

### Option 3: MongoDB Compass (Visual)

1. Open MongoDB Compass
2. Go to `neighbourhood_marketplace` database
3. Right-click `Users` collection
4. Click "Drop collection"
5. Confirm deletion

---

### Option 4: Direct MongoDB Query

```javascript
// In MongoDB shell or Compass:
use neighbourhood_marketplace
db.users.deleteMany({})

// Verify:
db.users.countDocuments()  // Should return 0
```

---

## Status: ✅ DONE

**Current database status:**
- ✅ Users deleted
- ✅ Ready for new registrations
- ✅ Can start from scratch

---

## Next Steps

1. Start backend:
   ```powershell
   cd backend
   npm start
   ```

2. Start frontend (new terminal):
   ```powershell
   cd frontend
   npm run dev
   ```

3. Open browser: `http://localhost:5173`

4. Register new user from scratch

---

## Notes

✅ Users are cleared - use `clearUsers.js`  
✅ All data can be cleared - use `clearAllData.js`  
✅ Both scripts are safe and reversible (restore from backup)  
✅ Your backend code is unchanged  

---

**Done! Start fresh now.** 🎉
