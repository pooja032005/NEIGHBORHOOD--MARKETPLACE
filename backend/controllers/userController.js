const User = require("../models/User");
const Item = require("../models/Item");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Diagnostic log to help debug profile update issues
    console.log('[updateProfile] user:', req.user?._id, 'body:', req.body);
    // Build update object from provided keys (allow empty strings)
    // Accept both 'city' and 'location' because frontend and auth use 'location'
    const allowed = ['name', 'phone', 'city', 'location', 'address', 'role', 'businessName', 'gst', 'profilePicture'];
    const updateData = {};

    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    // Server-side phone validation
    if (updateData.phone) {
      const digits = updateData.phone.toString().replace(/\D/g, '');
      if (digits.length !== 10) {
        return res.status(400).json({ message: 'Phone must contain exactly 10 digits' });
      }
      if (!/^\d{10}$/.test(digits)) {
        return res.status(400).json({ message: 'Phone must contain only digits' });
      }
      updateData.phone = digits; // normalize
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

exports.getWishlistCount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const count = user.wishlist ? user.wishlist.length : 0;
    res.json({ count, wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching wishlist count", error: err.message });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    
    if (!['buyer', 'seller'].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role. Must be 'buyer' or 'seller'" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role: newRole },
      { new: true }
    ).select("-password");

    res.json({
      message: "Role changed successfully",
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Error changing role", error: err.message });
  }
};

// ADMIN MANAGEMENT - Change any user to admin
exports.makeUserAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: 'admin' },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User promoted to admin successfully",
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Error promoting user to admin", error: err.message });
  }
};

// GET all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

exports.getFeaturedItem = async (req, res) => {
  try {
    const featuredItem = await Item.findOne({ isFeatured: true }).populate('owner', 'name email phone');
    
    if (!featuredItem) {
      return res.json(null);
    }
    
    res.json(featuredItem);
  } catch (err) {
    res.status(500).json({ message: "Error fetching featured item", error: err.message });
  }
};
