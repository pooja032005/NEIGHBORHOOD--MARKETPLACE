/**
 * Migration script to normalize `category` fields on items and services.
 * Usage: node scripts/normalizeCategories.js
 * Make sure backend can connect to DB (use same env as server).
 */
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Service = require('../models/Service');
const db = require('../config/db');

// Canonical list (keep in sync with frontend)
const CANONICAL = [
  'Electronics',
  'Home Goods',
  'Fashion',
  'Games',
  'Books',
  'Sports',
  'Others'
];

// Simple mapping for common variants -> canonical
const VARIANT_MAP = {
  electronics: 'Electronics',
  electronic: 'Electronics',
  'home': 'Home Goods',
  'home goods': 'Home Goods',
  'home-goods': 'Home Goods',
  fashion: 'Fashion',
  clothes: 'Fashion',
  clothing: 'Fashion',
  dresses: 'Fashion',
  games: 'Games',
  'video games': 'Games',
  books: 'Books',
  literature: 'Books',
  sports: 'Sports',
  sport: 'Sports',
};

function normalizeValue(raw) {
  if (!raw) return 'Others';
  const v = raw.toString().trim();
  const low = v.toLowerCase();
  // exact match
  for (const can of CANONICAL) {
    if (low === can.toLowerCase()) return can;
  }
  // variant map
  if (VARIANT_MAP[low]) return VARIANT_MAP[low];
  // contains canonical word
  for (const can of CANONICAL) {
    if (low.includes(can.toLowerCase().split(' ')[0])) return can;
  }
  // fallback
  return 'Others';
}

async function run() {
  try {
    console.log('Connecting to DB...');
    await db.connect();

    // Normalize items
    const items = await Item.find({});
    console.log(`Found ${items.length} items`);
    let updatedItems = 0;
    for (const it of items) {
      const norm = normalizeValue(it.category);
      if (it.category !== norm) {
        it.category = norm;
        await it.save();
        updatedItems++;
      }
    }
    console.log(`Updated ${updatedItems} items`);

    // Normalize services
    const services = await Service.find({});
    console.log(`Found ${services.length} services`);
    let updatedServices = 0;
    for (const s of services) {
      const norm = normalizeValue(s.category);
      if (s.category !== norm) {
        s.category = norm;
        await s.save();
        updatedServices++;
      }
    }
    console.log(`Updated ${updatedServices} services`);

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

run();
