const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Validation constants
const NAME_MAX = 50;
const EMAIL_MAX = 100;
const ADDRESS_MAX = 200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper function to send verification email
const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - Neighborhood Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Neighborhood Marketplace!</h2>
          <p>Please verify your email address to complete your registration and start using our platform.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationLink}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    console.error('Error sending verification email:', err.message);
  }
};

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

    // Create user with email verification disabled
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashed,
      location: trimmedLocation,
      role: normalizedRole,
      emailVerified: true // Auto-verify since email verification is disabled
    });

    // Generate JWT token and auto-login
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// Verify email endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Generate login token
    const loginToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      message: "Email verified successfully",
      token: loginToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Email verification error", error: err.message });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: "Email is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    await sendVerificationEmail(trimmedEmail, verificationLink);

    res.json({
      message: "Verification email sent successfully",
      email: trimmedEmail
    });
  } catch (err) {
    res.status(500).json({ message: "Error resending verification email", error: err.message });
  }
};
