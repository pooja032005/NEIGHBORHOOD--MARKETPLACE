// backend/routes/adminAnalytics.js
const express = require('express');
const { auth, requireAdmin } = require('../utils/authMiddleware');
const User = require('../models/User');
const Item = require('../models/Item');
const ProductAnalytics = require('../models/ProductAnalytics');
const Order = require('../models/Order');

const router = express.Router();

// Middleware: Auth + Admin check
const adminAuth = [auth, requireAdmin];

/**
 * GET /api/admin/stats/products
 * Get product analytics: most viewed, most wishlisted, best sellers
 */
router.get('/products', adminAuth, async (req, res) => {
  try {
    const analytics = await ProductAnalytics.find().lean();
    const productIds = analytics.map(a => a.productId);
    const products = await Item.find({ _id: { $in: productIds } }).lean();

    const productsWithAnalytics = analytics.map(a => {
      const product = products.find(p => p._id.toString() === a.productId.toString());
      return { ...a, product };
    });

    const mostViewed = [...productsWithAnalytics].sort((a, b) => b.views - a.views).slice(0, 10);
    const mostWishlisted = [...productsWithAnalytics].sort((a, b) => b.wishlistAdds - a.wishlistAdds).slice(0, 10);
    const bestSellers = [...productsWithAnalytics].sort((a, b) => b.purchases - a.purchases).slice(0, 10);

    res.json({
      mostViewed,
      mostWishlisted,
      bestSellers,
      totalProducts: products.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/stats/users
 * Get user statistics: total users, buyers, sellers, breakdown
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: 'buyer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const admins = await User.countDocuments({ role: 'admin' });

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      totalUsers,
      buyers,
      sellers,
      admins,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/stats/sales
 * Get sales data: total revenue, orders, breakdown by status
 */
router.get('/sales', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().lean();

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
    const shippedOrders = orders.filter(o => o.orderStatus === 'shipped').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.json({
      totalRevenue,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      shippedOrders,
      cancelledOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/stats/categories
 * Get category-wise statistics
 */
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const items = await Item.find().lean();
    const categories = {};

    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = { count: 0, totalPrice: 0, totalViews: 0 };
      }
      categories[item.category].count += 1;
      categories[item.category].totalPrice += item.price || 0;
    });

    const analytics = await ProductAnalytics.find().lean();
    analytics.forEach(a => {
      const product = items.find(p => p._id.toString() === a.productId.toString());
      if (product && categories[product.category]) {
        categories[product.category].totalViews += a.views;
      }
    });

    const categoryStats = Object.entries(categories).map(([name, data]) => ({
      name,
      productCount: data.count,
      totalPrice: data.totalPrice,
      averagePrice: data.count > 0 ? data.totalPrice / data.count : 0,
      totalViews: data.totalViews,
    }));

    res.json({ categoryStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/stats/sellers
 * Get seller information and top performers
 */
router.get('/sellers', adminAuth, async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .select('name email businessName phone location createdAt')
      .lean();

    const sellersWithStats = await Promise.all(
      sellers.map(async seller => {
        const products = await Item.find({ sellerId: seller._id }).lean();
        const productIds = products.map(p => p._id);
        const analytics = await ProductAnalytics.find({ productId: { $in: productIds } }).lean();
        const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
        const totalPurchases = analytics.reduce((sum, a) => sum + a.purchases, 0);

        return {
          ...seller,
          productCount: products.length,
          totalViews,
          totalPurchases,
        };
      })
    );

    res.json({
      totalSellers: sellers.length,
      sellers: sellersWithStats.sort((a, b) => b.totalPurchases - a.totalPurchases),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
