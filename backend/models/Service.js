const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  imageUrl: String,
  category: String,
  priceType: String,
  price: Number,
  location: String
});

module.exports = mongoose.model("Service", ServiceSchema);
