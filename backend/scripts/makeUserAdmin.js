#!/usr/bin/env node

/**
 * Script to convert a registered user to admin
 * Usage: node scripts/makeUserAdmin.js <userId>
 * 
 * Example:
 * node scripts/makeUserAdmin.js 6544a1b2c3d4e5f6g7h8i9j0
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('Usage: node scripts/makeUserAdmin.js <userId>');
  process.exit(1);
}

// Validate MongoDB connection
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not set in .env file');
  process.exit(1);
}

// Connect to MongoDB and make user admin
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`❌ Error: User with ID "${userId}" not found`);
      process.exit(1);
    }
    
    console.log(`\n📋 Found User:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    
    // Update user to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`\n✅ Successfully promoted to ADMIN!`);
    console.log(`   New Role: ${user.role}`);
    console.log(`\n✨ User can now access admin features\n`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});
