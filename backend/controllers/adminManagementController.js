const User = require("../models/User");
const Item = require("../models/Item");
const Service = require("../models/Service");
const Order = require("../models/Order");
const Booking = require("../models/Booking");

// ==================== USERS MANAGEMENT ====================

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating role", error: err.message });
  }
};

// Block user
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User blocked", user });
  } catch (err) {
    res.status(500).json({ message: "Error blocking user", error: err.message });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User unblocked", user });
  } catch (err) {
    res.status(500).json({ message: "Error unblocking user", error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// ==================== ITEMS MANAGEMENT ====================

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const items = await Item.find()
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments();

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err.message });
  }
};

// Get single item
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate("owner", "name email");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching item", error: err.message });
  }
};

// Approve item
exports.approveItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByIdAndUpdate(
      itemId,
      { isApproved: true },
      { new: true }
    ).populate("owner", "name email");

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item approved", item });
  } catch (err) {
    res.status(500).json({ message: "Error approving item", error: err.message });
  }
};

// Reject item
exports.rejectItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByIdAndUpdate(
      itemId,
      { isApproved: false },
      { new: true }
    ).populate("owner", "name email");

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item rejected", item });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting item", error: err.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err.message });
  }
};

// ==================== SERVICES MANAGEMENT ====================

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const services = await Service.find()
      .populate("provider", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments();

    res.json({
      services,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching services", error: err.message });
  }
};

// Get single service
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId).populate(
      "provider",
      "name email"
    );
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Error fetching service", error: err.message });
  }
};

// Approve service
exports.approveService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { isApproved: true },
      { new: true }
    ).populate("provider", "name email");

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Service approved", service });
  } catch (err) {
    res.status(500).json({ message: "Error approving service", error: err.message });
  }
};

// Reject service
exports.rejectService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { isApproved: false },
      { new: true }
    ).populate("provider", "name email");

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Service rejected", service });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting service", error: err.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndDelete(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting service", error: err.message });
  }
};

// ==================== ANALYTICS ====================

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const totalItems = await Item.countDocuments();
    const approvedItems = await Item.countDocuments({ isApproved: true });
    const pendingItems = await Item.countDocuments({ isApproved: false });

    const totalServices = await Service.countDocuments();
    const approvedServices = await Service.countDocuments({ isApproved: true });
    const pendingServices = await Service.countDocuments({ isApproved: false });

    const totalOrders = await Order.countDocuments();
    const totalBookings = await Booking.countDocuments();

    res.json({
      users: {
        total: totalUsers,
        sellers: totalSellers,
        buyers: totalBuyers,
        blocked: blockedUsers,
      },
      items: {
        total: totalItems,
        approved: approvedItems,
        pending: pendingItems,
      },
      services: {
        total: totalServices,
        approved: approvedServices,
        pending: pendingServices,
      },
      orders: totalOrders,
      bookings: totalBookings,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};

// Get pending items
exports.getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({ isApproved: false })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending items", error: err.message });
  }
};

// Get pending services
exports.getPendingServices = async (req, res) => {
  try {
    const services = await Service.find({ isApproved: false })
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending services", error: err.message });
  }
};
