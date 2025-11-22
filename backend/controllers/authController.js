const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Validation constants
const NAME_MAX = 50;
const EMAIL_MAX = 100;
const ADDRESS_MAX = 200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password, location, role } = req.body;

    // Validate name
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: "Name is required" });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (trimmedName.length > NAME_MAX) {
      return res.status(400).json({ message: `Name must be at most ${NAME_MAX} characters` });
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: "Email is required" });
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail.length === 0) {
      return res.status(400).json({ message: "Email cannot be empty" });
    }
    if (trimmedEmail.length > EMAIL_MAX) {
      return res.status(400).json({ message: `Email must be at most ${EMAIL_MAX} characters` });
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Validate location
    if (!location || typeof location !== 'string') {
      return res.status(400).json({ message: "Location is required" });
    }
    const trimmedLocation = location.trim();
    if (trimmedLocation.length === 0) {
      return res.status(400).json({ message: "Location cannot be empty" });
    }
    if (trimmedLocation.length > ADDRESS_MAX) {
      return res.status(400).json({ message: `Location must be at most ${ADDRESS_MAX} characters` });
    }

    const exists = await User.findOne({ email: trimmedEmail });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Normalize incoming role values to match schema enum
    const normalizedRole = (role === 'user') ? 'buyer' : (role || 'buyer');

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashed,
      location: trimmedLocation,
      role: normalizedRole
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: "Email is required" });
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};
