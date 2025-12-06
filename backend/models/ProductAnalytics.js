const mongoose = require("mongoose");

const ProductAnalyticsSchema = new mongoose.Schema(
  {
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Item",
      required: true,
      unique: true,
    },
    views: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 },
    cartAdds: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ProductAnalytics || mongoose.model("ProductAnalytics", ProductAnalyticsSchema);
