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
      owner: req.user._id,
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
    if (!product || product.owner.toString() !== req.user._id.toString()) {
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
    if (!product || product.owner.toString() !== req.user._id.toString()) {
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
    const sellerId = req.user._id;
    
    // Get all products owned by this seller
    const products = await Item.find({ owner: sellerId }).lean();
    const productIds = products.map(p => p._id);

    // Get analytics for these products
    const analytics = await ProductAnalytics.find({ productId: { $in: productIds } }).lean();

    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalWishlistAdds = analytics.reduce((sum, a) => sum + a.wishlistAdds, 0);
    const totalPurchases = analytics.reduce((sum, a) => sum + a.purchases, 0);

    // Get all orders where the item's owner is this seller
    const allOrders = await Order.find({ itemId: { $in: productIds } })
      .populate('buyerId', 'name email')
      .populate('itemId', 'title price owner')
      .lean();

    // Filter to ensure the item owner is the current seller
    const sellerOrders = allOrders.filter(order => {
      return order.itemId && order.itemId.owner?.toString() === sellerId.toString();
    });

    // Format orders with buyer details
    const formattedOrders = sellerOrders.map(order => ({
      _id: order._id,
      itemName: order.itemId?.title || 'N/A',
      buyerName: order.buyerId?.name || order.deliveryAddress?.name || 'N/A',
      buyerEmail: order.buyerId?.email || order.deliveryAddress?.email || 'N/A',
      quantity: order.quantity || 1,
      totalPrice: order.totalPrice || 0,
      orderStatus: order.orderStatus || 'pending',
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt
    }));

    console.log('Seller dashboard query:', {
      sellerId: sellerId.toString(),
      productsCount: products.length,
      productIds: productIds.map(p => p.toString()),
      allOrdersCount: allOrders.length,
      sellerOrdersCount: formattedOrders.length
    });

    res.json({
      totalProducts: products.length,
      totalViews,
      totalWishlistAdds,
      totalPurchases,
      totalOrders: formattedOrders.length,
      products,
      analytics,
      orders: formattedOrders,
    });
  } catch (err) {
    console.error('Seller dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
