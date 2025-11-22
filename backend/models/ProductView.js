const mongoose = require("mongoose");

const ProductViewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "productType",
      required: true,
    },
    productType: {
      type: String,
      enum: ["Item", "Service"],
      required: true,
    },
    viewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Anonymous views will have null
    },
    viewerRole: {
      type: String,
      enum: ["buyer", "seller", "admin", "anonymous"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
ProductViewSchema.index({ product: 1, productType: 1 });
ProductViewSchema.index({ viewedBy: 1 });
ProductViewSchema.index({ timestamp: -1 });

module.exports =
  mongoose.models.ProductView ||
  mongoose.model("ProductView", ProductViewSchema);
