const ProductView = require("../models/ProductView");

/**
 * Log a product view
 * @param {String} productId - MongoDB ObjectId of the product
 * @param {String} productType - "Item" or "Service"
 * @param {Object} user - Authenticated user (from req.user) or null for anonymous
 */
exports.logProductView = async (productId, productType, user) => {
  try {
    const viewerRole = user ? user.role : "anonymous";
    const viewedBy = user ? user.id : null;

    await ProductView.create({
      product: productId,
      productType,
      viewedBy,
      viewerRole,
    });
  } catch (err) {
    console.error("Error logging product view:", err);
    // Don't throw; view tracking should not break the main request
  }
};
