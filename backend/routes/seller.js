// backend/routes/seller.js
const express = require('express');
const { auth, requireSeller } = require('../utils/authMiddleware');
const Item = require('../models/Item');
const ProductAnalytics = require('../models/ProductAnalytics');
const Order = require('../models/Order');

const router = express.Router();

// Middleware: Auth + Seller check
const sellerAuth = [auth, requireSeller];

/**
 * GET /api/seller/products
 * Get all products created by this seller
 */
router.get('/products', sellerAuth, async (req, res) => {
  try {
    const products = await Item.find({ owner: req.user._id }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/seller/products/:id
 * Get a single product with analytics
 */
router.get('/products/:id', sellerAuth, async (req, res) => {
  try {
    const product = await Item.findById(req.params.id);
    if (!product || product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your product' });
    }
    const analytics = await ProductAnalytics.findOne({ productId: req.params.id });
    res.json({ product, analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/seller/products
 * Create a new product
 */
router.post('/products', sellerAuth, async (req, res) => {
  try {
    const { title, description, imageUrl, category, condition, price, location } = req.body;

    // Validate required fields
    if (!title || !description || !category || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newItem = new Item({
      title,
      description,
      imageUrl,
      category,
      condition: condition || 'new',
      price,
      location,
      sellerId: req.user._id,
      postedBy: req.user.name || req.user.email,
    });

    const saved = await newItem.save();

    // Initialize analytics
    const analytics = new ProductAnalytics({ productId: saved._id });
    await analytics.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/seller/products/:id
 * Update a product
 */
router.put('/products/:id', sellerAuth, async (req, res) => {
  try {
    const product = await Item.findById(req.params.id);
    if (!product || product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your product' });
    }

    const { title, description, imageUrl, category, condition, price, location } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (imageUrl) product.imageUrl = imageUrl;
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (price) product.price = price;
    if (location) product.location = location;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/seller/products/:id
 * Delete a product
 */
router.delete('/products/:id', sellerAuth, async (req, res) => {
  try {
    const product = await Item.findById(req.params.id);
    if (!product || product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your product' });
    }

    await Item.deleteOne({ _id: req.params.id });
    await ProductAnalytics.deleteOne({ productId: req.params.id });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/seller/orders
 * Get all orders for products sold by this seller
 */
router.get('/orders', sellerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ 'items.sellerId': req.user._id })
      .populate('buyerId', 'name email phone')
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/seller/dashboard
 * Get seller dashboard stats
 */
router.get('/dashboard', sellerAuth, async (req, res) => {
  try {
    const products = await Item.find({ owner: req.user._id }).lean();
    const productIds = products.map(p => p._id);

    const analytics = await ProductAnalytics.find({ productId: { $in: productIds } }).lean();

    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalWishlistAdds = analytics.reduce((sum, a) => sum + a.wishlistAdds, 0);
    const totalPurchases = analytics.reduce((sum, a) => sum + a.purchases, 0);

    const orders = await Order.find({ 'items.sellerId': req.user._id }).lean();

    res.json({
      totalProducts: products.length,
      totalViews,
      totalWishlistAdds,
      totalPurchases,
      totalOrders: orders.length,
      products,
      analytics,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
