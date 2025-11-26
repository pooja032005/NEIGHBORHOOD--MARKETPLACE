const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
  condition: String,
  price: Number,
  location: String,
  status: { type: String, default: "available" },
  isFeatured: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true }, // Admin approval flag
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", ItemSchema);
