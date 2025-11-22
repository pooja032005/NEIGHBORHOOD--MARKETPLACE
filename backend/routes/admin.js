const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { auth, requireAdmin } = require("../utils/authMiddleware");

// Track a view (can be called without auth by frontend)
router.post("/track-view", adminController.trackView);

// All remaining admin routes require authentication + admin role
router.use(auth);
router.use(requireAdmin);

// Overview stats
router.get("/overview", adminController.getOverviewStats);

// Top products
router.get("/top-products", adminController.getTopProducts);

// Viewer interest (buyers vs sellers)
router.get("/viewer-interest", adminController.getViewerInterest);

// Category-wise stats
router.get("/category-stats", adminController.getCategoryStats);

// Seller performance
router.get("/seller-performance", adminController.getSellerPerformance);

// View trends
router.get("/view-trends", adminController.getViewTrends);

module.exports = router;
