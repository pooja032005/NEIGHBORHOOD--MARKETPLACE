// backend/controllers/userActionsController.js
const User = require("../models/User");
const Item = require("../models/Item"); // for basic validation

// Get cart (populate item)
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.item");
    return res.json({ cart: user.cart || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching cart" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { itemId, qty = 1 } = req.body;
    if (!itemId) return res.status(400).json({ message: "Missing itemId" });
    // verify item exists
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Item exists; allow adding to cart (basic checks only)

    const user = await User.findById(req.user._id);
    const existing = user.cart.find(c => c.item.equals(itemId));
    if (existing) {
      existing.qty = Math.max(1, existing.qty + Number(qty));
    } else {
      user.cart.push({ item: itemId, qty: Number(qty) });
    }
    await user.save();
    await user.populate("cart.item");
    res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(c => !c.item.equals(itemId));
    await user.save();
    await user.populate("cart.item");
    res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing from cart" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist.item");
    return res.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!itemId) return res.status(400).json({ message: "Missing itemId" });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const user = await User.findById(req.user._id);
    if (!user.wishlist.find(w => w.item.equals(itemId))) {
      user.wishlist.push({ item: itemId });
      await user.save();
    }
    await user.populate("wishlist.item");
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding to wishlist" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(w => !w.item.equals(itemId));
    await user.save();
    await user.populate("wishlist.item");
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing from wishlist" });
  }
};
