const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Require admin role
exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No user' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// Require buyer role
exports.requireBuyer = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No user' });
  if (req.user.role !== 'buyer') return res.status(403).json({ message: 'Buyer access required' });
  next();
};

// Require seller role
exports.requireSeller = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No user' });
  if (req.user.role !== 'seller') return res.status(403).json({ message: 'Seller access required' });
  next();
};
