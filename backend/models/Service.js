const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  imageUrl: String,
  category: String,
  priceType: String,
  price: Number,
  location: String,
  isApproved: { type: Boolean, default: true }, // Admin approval flag
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Service", ServiceSchema);
