#!/usr/bin/env node

/**
 * Script to delete all registered users from database
 * Usage: node scripts/clearUsers.js
 * 
 * WARNING: This will delete ALL user records. Cannot be undone!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

if (!process.env.MONGO_URI) {
  console.error('❌ Error: MONGO_URI not set in .env file');
  process.exit(1);
}

console.log('⚠️  WARNING: This will DELETE ALL users from the database!');
console.log('This action CANNOT be undone.\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Count users before deletion
    const countBefore = await User.countDocuments();
    console.log(`📊 Current users in database: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('\n✅ No users to delete. Database is already empty!\n');
      process.exit(0);
    }
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} users!`);
    
    // Verify deletion
    const countAfter = await User.countDocuments();
    console.log(`📊 Users remaining in database: ${countAfter}`);
    
    console.log('\n✨ Database cleared! Ready to register new users.\n');
    
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
