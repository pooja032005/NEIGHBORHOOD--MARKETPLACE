#!/usr/bin/env node

/**
 * Quick script to create an admin user for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  location: String,
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  isBlocked: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ Error: MONGO_URI not set in .env file');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      location: 'Test Location',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: admin@test.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin`);
    console.log('\n📝 Use these credentials to login at http://localhost:5174/admin-login');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdminUser();
