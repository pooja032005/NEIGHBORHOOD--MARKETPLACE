# Quick Admin Setup - Copy & Paste Ready

## 🚀 FASTEST WAY: Using API

### Step 1: Get JWT Token by Logging In
```
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your@email.com\",\"password\":\"password\"}"
```

Copy the `token` from response

### Step 2: Get All Users (to find the user ID)
```
curl -X GET http://localhost:5000/api/users/admin/all-users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Copy the user's `_id` you want to make admin

### Step 3: Make User Admin
```
curl -X POST http://localhost:5000/api/users/admin/make-admin \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"PASTE_USER_ID_HERE\"}"
```

**Done! User is now admin.** ✅

---

## Alternative: Node Script (If User ID Known)

```powershell
cd backend
node scripts/makeUserAdmin.js YOUR_USER_ID_HERE
```

Example:
```powershell
node scripts/makeUserAdmin.js 6544a1b2c3d4e5f6g7h8i9j0
```

---

## Using Postman (Visual Way)

1. **Login**: POST `http://localhost:5000/api/auth/login`
   - Get token
   
2. **Get Users**: GET `http://localhost:5000/api/users/admin/all-users`
   - Header: `Authorization: Bearer TOKEN`
   - Find user ID
   
3. **Make Admin**: POST `http://localhost:5000/api/users/admin/make-admin`
   - Header: `Authorization: Bearer TOKEN`
   - Body: `{"userId":"USER_ID"}`

---

## PowerShell Command (All-in-One)

```powershell
# 1. Login and extract token
$loginResponse = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"your@email.com","password":"password"}' | ConvertFrom-Json

$token = $loginResponse.token

# 2. Get all users
$usersResponse = curl -X GET http://localhost:5000/api/users/admin/all-users `
  -H "Authorization: Bearer $token" | ConvertFrom-Json

# Show users
$usersResponse | Format-Table name, email, role, _id

# 3. Make user admin (copy userId from list above)
curl -X POST http://localhost:5000/api/users/admin/make-admin `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"userId":"PASTE_ID_HERE"}'
```

---

## What Changed in Code

✅ `backend/models/User.js` - Added 'admin' to role enum  
✅ `backend/controllers/userController.js` - Added `makeUserAdmin()` and `getAllUsers()`  
✅ `backend/routes/users.js` - Added routes for admin endpoints  
✅ `backend/scripts/makeUserAdmin.js` - Node script for making users admin  

---

## Verification

After making user admin, verify with:

```
GET http://localhost:5000/api/users/admin/all-users
Headers: Authorization: Bearer TOKEN
```

Look for the user - their `role` should be `"admin"` ✅

---

**Need detailed guide?** See `MAKE_USER_ADMIN_GUIDE.md`
