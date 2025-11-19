// backend/routes/userActions.js
const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require("../controllers/userActionsController");
const { auth } = require("../utils/authMiddleware");

router.get("/cart", auth, getCart);
router.post("/cart", auth, addToCart);              // body: { itemId, qty }
router.delete("/cart/:itemId", auth, removeFromCart);

router.get("/wishlist", auth, getWishlist);
router.post("/wishlist/:itemId", auth, addToWishlist);
router.delete("/wishlist/:itemId", auth, removeFromWishlist);

module.exports = router;
