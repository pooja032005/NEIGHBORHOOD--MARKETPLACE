const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  imageUrl: String,
  category: {
    type: String,
    enum: [
      'Electronics',
      'Home Goods',
      'Fashion',
      'Games',
      'Books',
      'Sports',
      'Others'
    ],
    default: 'Others'
  },
  priceType: String,
  price: Number,
  location: String,
  isApproved: { type: Boolean, default: true }, // Admin approval flag
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Service", ServiceSchema);
