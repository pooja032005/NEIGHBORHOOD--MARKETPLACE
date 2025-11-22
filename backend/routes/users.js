// backend/routes/users.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, changeRole, getFeaturedItem, getWishlistCount, makeUserAdmin, getAllUsers } = require("../controllers/userController");
const { auth, requireAdmin } = require("../utils/authMiddleware");

// USER PROFILE ROUTES
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/profile/role", auth, changeRole);

// WISHLIST COUNT ROUTE
router.get("/wishlist/count", auth, getWishlistCount);

// FEATURED ITEM ROUTE (NO AUTH REQUIRED - Public)
router.get("/featured-item", getFeaturedItem);

// ADMIN ROUTES (admin only)
router.post("/admin/make-admin", auth, requireAdmin, makeUserAdmin);
router.get("/admin/all-users", auth, requireAdmin, getAllUsers);
// Set password for a user (admin only)
router.post("/admin/set-password", auth, requireAdmin, async (req, res) => {
	try {
		const { userId, newPassword } = req.body;
		if (!userId || !newPassword) return res.status(400).json({ message: 'userId and newPassword required' });
		const bcrypt = require('bcryptjs');
		const hashed = await bcrypt.hash(newPassword, 10);
		const user = await require('../models/User').findByIdAndUpdate(userId, { password: hashed }, { new: true });
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json({ message: 'Password updated' });
	} catch (err) {
		res.status(500).json({ message: 'Error setting password', error: err.message });
	}
});

module.exports = router;
