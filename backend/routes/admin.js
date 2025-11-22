const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authMiddleware } = require("../utils/authMiddleware");

// All admin routes require authentication
router.use(authMiddleware);

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
