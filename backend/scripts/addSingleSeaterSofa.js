#!/usr/bin/env node
/**
 * One-off script to add a 'Single Seater Sofa' item under 'Home Goods'
 * Usage: node scripts/addSingleSeaterSofa.js
 * Ensure MONGO_URI is set in your environment (same as when running the server).
 */
require('dotenv').config();
const db = require('../config/db');
const Item = require('../models/Item');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function ensureAdminOrSeller() {
  // Prefer an existing seller
  let user = await User.findOne({ role: 'seller' });
  if (user) return user;

  // If no seller, try admin
  user = await User.findOne({ email: 'admin@test.com' });
  if (user) return user;

  // Create an admin user (safe for local/testing)
  const hashed = await bcrypt.hash('admin123', 10);
  const admin = new User({
    name: 'Auto Admin',
    email: 'admin@test.com',
    password: hashed,
    location: 'Local',
    role: 'admin'
  });
  await admin.save();
  return admin;
}

async function run() {
  try {
    console.log('Connecting to DB...');
    await db.connect();

    const owner = await ensureAdminOrSeller();
    console.log('Using owner:', owner.email, owner._id.toString());

    const payload = {
      title: 'Single Seater Sofa',
      description: 'Comfortable single seater sofa in good condition. Dimensions: 85x90x95 cm. Upholstery: fabric. Ideal for living rooms and reading corners.',
      imageUrl: '/uploads/single_seater_sofa.jpg',
      category: 'Home Goods',
      condition: 'used',
      price: 4999,
      location: owner.location || 'Local',
      owner: owner._id,
      status: 'available',
      isFeatured: false,
      isApproved: true
    };

    const exists = await Item.findOne({ title: payload.title, owner: owner._id });
    if (exists) {
      console.log('Item already exists:', exists._id.toString());
      await process.exit(0);
    }

    const item = await Item.create(payload);
    console.log('Created item:', item._id.toString());
    console.log('Title:', item.title);
    console.log('Category:', item.category);

    process.exit(0);
  } catch (err) {
    console.error('Failed to add product:', err);
    process.exit(1);
  }
}

run();
