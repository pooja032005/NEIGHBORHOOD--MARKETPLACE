const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUserRole,
  blockUser,
  unblockUser,
  deleteUser,
  getAllItems,
  getItem,
  approveItem,
  rejectItem,
  deleteItem,
  getAllServices,
  getService,
  approveService,
  rejectService,
  deleteService,
  getDashboardStats,
  getPendingItems,
  getPendingServices,
} = require("../controllers/adminManagementController");
const { auth, requireAdmin } = require("../utils/authMiddleware");

// Protect all admin routes with auth and admin check
router.use(auth);
router.use(requireAdmin);

// ==================== USERS ROUTES ====================
router.get("/users", getAllUsers);
router.get("/users/:userId", getUser);
router.put("/users/:userId/role", updateUserRole);
router.post("/users/:userId/block", blockUser);
router.post("/users/:userId/unblock", unblockUser);
router.delete("/users/:userId", deleteUser);

// ==================== ITEMS ROUTES ====================
router.get("/items", getAllItems);
router.get("/items/:itemId", getItem);
router.post("/items/:itemId/approve", approveItem);
router.post("/items/:itemId/reject", rejectItem);
router.delete("/items/:itemId", deleteItem);

// ==================== SERVICES ROUTES ====================
router.get("/services", getAllServices);
router.get("/services/:serviceId", getService);
router.post("/services/:serviceId/approve", approveService);
router.post("/services/:serviceId/reject", rejectService);
router.delete("/services/:serviceId", deleteService);

// ==================== ANALYTICS ROUTES ====================
router.get("/stats", getDashboardStats);
router.get("/pending-items", getPendingItems);
router.get("/pending-services", getPendingServices);

module.exports = router;
