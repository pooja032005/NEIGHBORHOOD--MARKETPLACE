const ProductView = require("../models/ProductView");
const Item = require("../models/Item");
const Service = require("../models/Service");
const Order = require("../models/Order");
const User = require("../models/User");

// Get top viewed items and services
exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Top viewed items
    const topItems = await ProductView.aggregate([
      { $match: { productType: "Item" } },
      { $group: { _id: "$product", viewCount: { $sum: 1 } } },
      { $sort: { viewCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
      {
        $project: {
          _id: 1,
          title: "$itemDetails.title",
          price: "$itemDetails.price",
          viewCount: 1,
        },
      },
    ]);

    // Top viewed services
    const topServices = await ProductView.aggregate([
      { $match: { productType: "Service" } },
      { $group: { _id: "$product", viewCount: { $sum: 1 } } },
      { $sort: { viewCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      { $unwind: "$serviceDetails" },
      {
        $project: {
          _id: 1,
          title: "$serviceDetails.title",
          price: "$serviceDetails.price",
          viewCount: 1,
        },
      },
    ]);

    res.json({
      topItems,
      topServices,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching top products", error: err.message });
  }
};

// Get viewer interest breakdown (buyers vs sellers views)
exports.getViewerInterest = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Views breakdown by role
    const roleBreakdown = await ProductView.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$viewerRole",
          count: { $sum: 1 },
        },
      },
    ]);

    // Item vs Service views
    const productTypeBreakdown = await ProductView.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$productType",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      roleBreakdown,
      productTypeBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching viewer interest", error: err.message });
  }
};

// Get category-wise performance
exports.getCategoryStats = async (req, res) => {
  try {
    // Item categories with view counts
    const itemCategories = await ProductView.aggregate([
      { $match: { productType: "Item" } },
      {
        $lookup: {
          from: "items",
          localField: "product",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
      {
        $group: {
          _id: "$item.category",
          viewCount: { $sum: 1 },
          totalPrice: { $sum: "$item.price" },
          avgPrice: { $avg: "$item.price" },
        },
      },
      { $sort: { viewCount: -1 } },
    ]);

    // Service categories with view counts
    const serviceCategories = await ProductView.aggregate([
      { $match: { productType: "Service" } },
      {
        $lookup: {
          from: "services",
          localField: "product",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $group: {
          _id: "$service.category",
          viewCount: { $sum: 1 },
          totalPrice: { $sum: "$service.price" },
          avgPrice: { $avg: "$service.price" },
        },
      },
      { $sort: { viewCount: -1 } },
    ]);

    res.json({
      itemCategories,
      serviceCategories,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching category stats", error: err.message });
  }
};

// Get seller performance (views on their products)
exports.getSellerPerformance = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Items by seller with view counts
    const sellerItemViews = await ProductView.aggregate([
      { $match: { productType: "Item" } },
      {
        $lookup: {
          from: "items",
          localField: "product",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
      {
        $lookup: {
          from: "users",
          localField: "item.owner",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $group: {
          _id: "$seller._id",
          sellerName: { $first: "$seller.name" },
          totalViews: { $sum: 1 },
          totalProducts: { $sum: 1 },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: limit },
    ]);

    res.json({
      sellerItemViews,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching seller performance", error: err.message });
  }
};

// Get overview stats
exports.getOverviewStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });
    const totalOrders = await Order.countDocuments();

    const totalViews = await ProductView.countDocuments();
    const buyerViews = await ProductView.countDocuments({ viewerRole: "buyer" });
    const sellerViews = await ProductView.countDocuments({ viewerRole: "seller" });
    const anonymousViews = await ProductView.countDocuments({
      viewerRole: "anonymous",
    });

    res.json({
      products: {
        items: totalItems,
        services: totalServices,
      },
      users: {
        total: totalUsers,
        sellers: totalSellers,
        buyers: totalBuyers,
      },
      orders: totalOrders,
      views: {
        total: totalViews,
        byBuyers: buyerViews,
        bySellers: sellerViews,
        anonymous: anonymousViews,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching overview stats", error: err.message });
  }
};

// Get daily view trends
exports.getViewTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await ProductView.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
          buyers: {
            $sum: { $cond: [{ $eq: ["$viewerRole", "buyer"] }, 1, 0] },
          },
          sellers: {
            $sum: { $cond: [{ $eq: ["$viewerRole", "seller"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ message: "Error fetching view trends", error: err.message });
  }
};

// Track a product view
exports.trackView = async (req, res) => {
  try {
    const { productId, productType } = req.body;
    if (!productId || !productType) {
      return res.status(400).json({ message: "productId and productType required" });
    }

    const { logProductView } = require("../utils/viewTracking");
    await logProductView(productId, productType, req.user || null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error tracking view", error: err.message });
  }
};
