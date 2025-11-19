# 🔐 How to Make a User Admin

## Overview
You can now convert any registered user account to an admin. There are **3 methods** to do this:

---

## Method 1: Using the API Endpoint ✅ (Easiest)

### Step 1: Get All Users
First, get the list of all users to find the user ID you want to make admin.

**Request:**
```
GET http://localhost:5000/api/users/admin/all-users
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "_id": "6544a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "phone": "+91-9999999999",
    "city": "Mumbai"
  },
  {
    "_id": "6544a1b2c3d4e5f6g7h8i9j1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "seller",
    "phone": "+91-8888888888",
    "city": "Delhi"
  }
]
```

### Step 2: Make User Admin
Copy the user `_id` and send a POST request to promote them.

**Request:**
```
POST http://localhost:5000/api/users/admin/make-admin
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "6544a1b2c3d4e5f6g7h8i9j0"
}
```

**Response:**
```json
{
  "message": "User promoted to admin successfully",
  "user": {
    "_id": "6544a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "phone": "+91-9999999999",
    "city": "Mumbai"
  }
}
```

---

## Method 2: Using Postman

### Step 1: Get JWT Token
1. Login to get JWT token
2. Copy the token

### Step 2: Get Users List
1. Create new request: **GET**
2. URL: `http://localhost:5000/api/users/admin/all-users`
3. Headers tab → Add: `Authorization: Bearer YOUR_TOKEN`
4. Send → Copy the user ID you want to make admin

### Step 3: Make User Admin
1. Create new request: **POST**
2. URL: `http://localhost:5000/api/users/admin/make-admin`
3. Headers tab → Add: `Authorization: Bearer YOUR_TOKEN`
4. Body → raw → JSON:
   ```json
   {
     "userId": "USER_ID_HERE"
   }
   ```
5. Send → Done! ✅

---

## Method 3: Using Node Script

### Step 1: Get User ID
First, you need the user's MongoDB ID. Run:
```powershell
cd backend
node scripts/makeUserAdmin.js <userId>
```

Example:
```powershell
node scripts/makeUserAdmin.js 6544a1b2c3d4e5f6g7h8i9j0
```

### Output:
```
✅ Connected to MongoDB
📋 Found User:
   Name: John Doe
   Email: john@example.com
   Current Role: buyer

✅ Successfully promoted to ADMIN!
   New Role: admin

✨ User can now access admin features
```

---

## Method 4: MongoDB Direct Query

If you have MongoDB compass open:

1. Go to `Users` collection
2. Find the user you want to make admin
3. Edit the document
4. Change: `"role": "buyer"` → `"role": "admin"`
5. Save

---

## Verification: Check If User is Admin

After making a user admin, verify by:

### Option 1: Get all users
```
GET http://localhost:5000/api/users/admin/all-users
```
Check if role is `"admin"`

### Option 2: Login as that user
The user can now login and see admin features.

---

## 🔑 Example: Complete Workflow

### 1. Login first (to get JWT token)
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "your@email.com",
  "password": "yourpassword"
}
Response: {
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "role": "buyer" }
}
```

### 2. Copy the token and get all users
```
GET http://localhost:5000/api/users/admin/all-users
Headers: {
  "Authorization": "Bearer eyJhbGciOi..."
}
```

### 3. Find the user to make admin and copy their ID

### 4. Make them admin
```
POST http://localhost:5000/api/users/admin/make-admin
Headers: {
  "Authorization": "Bearer eyJhbGciOi...",
  "Content-Type": "application/json"
}
Body: {
  "userId": "6544a1b2c3d4e5f6g7h8i9j0"
}
Response: {
  "message": "User promoted to admin successfully",
  "user": { "role": "admin" }
}
```

### 5. Done! ✅ User is now admin

---

## Quick Reference

| What | Command |
|------|---------|
| Get all users | `GET /api/users/admin/all-users` |
| Make user admin | `POST /api/users/admin/make-admin` with `userId` |
| Using script | `node scripts/makeUserAdmin.js <userId>` |

---

## Notes

✅ You need a valid JWT token to use the API endpoints  
✅ The user must exist in the database  
✅ You can make any user (buyer or seller) into admin  
✅ Admin role is now supported: 'buyer', 'seller', **'admin'**  
✅ Multiple admins can exist  

---

## Test the Admin Role

After making a user admin:
1. Have that user login
2. They can now access: `/api/users/admin/all-users`
3. They can promote other users to admin: `/api/users/admin/make-admin`

---

**Done! Your user is now an admin.** 🎉
