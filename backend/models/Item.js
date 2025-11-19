const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  imageUrl: String,
  category: String,
  condition: String,
  price: Number,
  location: String,
  status: { type: String, default: "available" },
  isFeatured: { type: Boolean, default: false }
});

module.exports = mongoose.model("Item", ItemSchema);
