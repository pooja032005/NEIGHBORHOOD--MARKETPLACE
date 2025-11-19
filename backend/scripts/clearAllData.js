#!/usr/bin/env node

/**
 * Script to delete ALL data from all collections in the database
 * Usage: node scripts/clearAllData.js
 * 
 * This clears:
 * - Users
 * - Items
 * - Orders
 * - Bookings
 * - Services
 * - Messages
 * - Addresses
 * 
 * WARNING: This is a COMPLETE database wipe. Cannot be undone!
 */

require('dotenv').config();
const mongoose = require('mongoose');

if (!process.env.MONGO_URI) {
  console.error('❌ Error: MONGO_URI not set in .env file');
  process.exit(1);
}

console.log('⚠️  WARNING: This will DELETE ALL DATA from the database!');
console.log('This action CANNOT be undone.\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`\n📊 Collections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Delete all collections
    let totalDeleted = 0;
    
    for (const collection of collections) {
      const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
      totalDeleted += result.deletedCount;
      console.log(`✅ Cleared ${collection.name} (${result.deletedCount} documents)`);
    }
    
    console.log(`\n✅ Total documents deleted: ${totalDeleted}`);
    console.log('✨ Database completely cleared! Ready to start fresh.\n');
    
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
