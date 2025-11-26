#!/usr/bin/env node
/**
 * Promote a user to 'seller' role.
 * Usage:
 *   node scripts/makeUserSeller.js <email-or-userId>
 */
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../config/db');
const User = require('../models/User');

async function run() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/makeUserSeller.js <email-or-userId>');
    process.exit(1);
  }

  try {
    await db.connect();
    let user = null;
    // try by id
    if (/^[0-9a-fA-F]{24}$/.test(arg)) {
      user = await User.findById(arg);
    }
    if (!user) {
      // try by email
      user = await User.findOne({ email: arg });
    }
    if (!user) {
      console.error('User not found for:', arg);
      process.exit(1);
    }

    user.role = 'seller';
    await user.save();
    console.log(`Success: user ${user.email || user._id} is now a seller`);
    process.exit(0);
  } catch (err) {
    console.error('Error promoting user:', err);
    process.exit(1);
  }
}

run();
