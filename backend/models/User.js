// backend/models/User.js
const mongoose = require("mongoose");

// Cart item schema
const CartItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

// Wishlist item schema
const WishlistItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  },
  { _id: false }
);

// MAIN USER SCHEMA
const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    location: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    profilePicture: { type: String, default: '' },
    
    // Seller specific fields
    businessName: { type: String, default: '' },
    gst: { type: String, default: '' },

    // Cart & Wishlist
    cart: [CartItemSchema],
    wishlist: [WishlistItemSchema],
  },
  { timestamps: true }
);

// PREVENT MODEL OVERWRITE ERROR
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
