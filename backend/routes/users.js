// backend/routes/users.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, changeRole, getFeaturedItem, getWishlistCount, makeUserAdmin, getAllUsers } = require("../controllers/userController");
const { auth } = require("../utils/authMiddleware");

// USER PROFILE ROUTES
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/profile/role", auth, changeRole);

// WISHLIST COUNT ROUTE
router.get("/wishlist/count", auth, getWishlistCount);

// FEATURED ITEM ROUTE (NO AUTH REQUIRED - Public)
router.get("/featured-item", getFeaturedItem);

// ADMIN ROUTES
router.post("/admin/make-admin", auth, makeUserAdmin);
router.get("/admin/all-users", auth, getAllUsers);

module.exports = router;
