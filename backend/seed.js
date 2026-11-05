// ============================================================
// seed.js
// Populates the database with realistic sample data for development.
// Run with:  npm run seed
//
// WARNING: This deletes ALL existing Users, Boats, Trips and Prices
//          before inserting fresh data. Do NOT run on production.
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User  = require('./models/User');
const Boat  = require('./models/Boat');
const Trip  = require('./models/Trip');
const Price = require('./models/Price');

// Helper: return a Date that is a given number of hours before now
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

// Helper: return a Date that is a given number of hours after now
function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Helper: return a Date that is a given number of days before now
function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function seedDatabase() {
  try {
    await connectDB();

    console.log('\nClearing existing data...');
    // Delete in this order to avoid any reference issues
    await Trip.deleteMany({});
    await Boat.deleteMany({});
    await User.deleteMany({});
    await Price.deleteMany({});
    console.log('Old data cleared.\n');

    // =====================================================
    // USERS
    // =====================================================

    // Hash all passwords before saving (bcrypt, salt rounds = 10)
    const salt = await bcrypt.genSalt(10);

    const hashedAdmin   = await bcrypt.hash('admin123',   salt);
    const hashedOfficer = await bcrypt.hash('officer123', salt);
    const hashedRamesh  = await bcrypt.hash('ramesh123',  salt);
    const hashedSuresh  = await bcrypt.hash('suresh123',  salt);

    const users = await User.insertMany([
      {
        name:     'Vikram Sharma',
        email:    'admin@seasafe.com',
        password: hashedAdmin,
        role:     'admin'
      },
      {
        name:     'Ravi Teja',
        email:    'officer@seasafe.com',
        password: hashedOfficer,
        role:     'officer'
      },
      {
        name:     'Ramesh Kumar',
        email:    'ramesh@seasafe.com',
        password: hashedRamesh,
        role:     'fisherman'
      },
      {
        name:     'Suresh Babu',
        email:    'suresh@seasafe.com',
        password: hashedSuresh,
        role:     'fisherman'
      }
    ]);

    // Store references for readability below
    var ramesh = users[2];
    var suresh = users[3];

    console.log('✓ Users created (4)');

    // =====================================================
    // BOATS  –  spread across Andhra Pradesh harbours
    // =====================================================

    const boats = await Boat.insertMany([
      {
        boatName:             'Sea Star',
        registrationNumber:   'AP-VZ-001',
        harbour:              'Visakhapatnam',
        owner:                ramesh._id,
        crew: [
          { name: 'Venkata Rao',    age: 45, phone: '+91 98765 43210' },
          { name: 'Srinivas Reddy', age: 32, phone: '+91 87654 32109' }
        ],
        emergencyContactName:  'Kamala Devi',
        emergencyContactPhone: '+91 76543 21098'
      },
      {
        boatName:             'Ocean King',
        registrationNumber:   'AP-KK-002',
        harbour:              'Kakinada',
        owner:                ramesh._id,
        crew: [
          { name: 'Lakshmi Narayana', age: 50, phone: '+91 65432 10987' },
          { name: 'Ravi Babu',        age: 28, phone: '+91 54321 09876' },
          { name: 'Kiran Kumar',      age: 35, phone: '+91 43210 98765' }
        ],
        emergencyContactName:  'Sarada Devi',
        emergencyContactPhone: '+91 32109 87654'
      },
      {
        boatName:             'Blue Wave',
        registrationNumber:   'AP-MP-003',
        harbour:              'Machilipatnam',
        owner:                suresh._id,
        crew: [
          { name: 'Murali Krishna', age: 42, phone: '+91 21098 76543' },
          { name: 'Prasad Rao',     age: 38, phone: '+91 10987 65432' }
        ],
        emergencyContactName:  'Nirmala Devi',
        emergencyContactPhone: '+91 99887 76655'
      },
      {
        boatName:             'Sagar Mitra',
        registrationNumber:   'AP-VZ-004',
        harbour:              'Visakhapatnam',
        owner:                suresh._id,
        crew: [
          { name: 'Anand Rao',      age: 55, phone: '+91 88776 65544' },
          { name: 'Subbaiah',       age: 33, phone: '+91 77665 54433' },
          { name: 'Nageswara Rao',  age: 27, phone: '+91 66554 43322' }
        ],
        emergencyContactName:  'Padmavathi',
        emergencyContactPhone: '+91 55443 32211'
      }
    ]);

    var seaStar   = boats[0];
    var oceanKing = boats[1];
    var blueWave  = boats[2];
    var sagarMitra = boats[3];

    console.log('✓ Boats created (4)');

    // =====================================================
    // TRIPS  –  6 trips with realistic dates
    // Rule: each boat has at most ONE active trip at a time.
    //   Sea Star:    1 Returned  +  1 At Sea      (active)
    //   Ocean King:  1 Returned  +  1 Overdue     (active)
    //   Blue Wave:   1 Returned
    //   Sagar Mitra: 1 Returned
    // =====================================================

    await Trip.insertMany([
      // ---- Trip 1: Sea Star – Returned (7 days ago trip) ----
      {
        boat:               seaStar._id,
        owner:              ramesh._id,
        departureTime:      daysAgo(7),
        expectedReturnTime: daysAgo(5),
        actualReturnTime:   daysAgo(5),
        status:             'Returned',
        catches: [
          { fishType: 'Tuna',   quantityKg: 50 },
          { fishType: 'Prawns', quantityKg: 30 }
        ],
        alertStatus: 'None'
      },

      // ---- Trip 2: Ocean King – Returned (10 days ago trip) ----
      {
        boat:               oceanKing._id,
        owner:              ramesh._id,
        departureTime:      daysAgo(10),
        expectedReturnTime: daysAgo(8),
        actualReturnTime:   daysAgo(8),
        status:             'Returned',
        catches: [
          { fishType: 'Sardines', quantityKg: 100 },
          { fishType: 'Pomfret',  quantityKg: 20  }
        ],
        alertStatus: 'None'
      },

      // ---- Trip 3: Blue Wave – Returned (5 days ago trip) ----
      {
        boat:               blueWave._id,
        owner:              suresh._id,
        departureTime:      daysAgo(5),
        expectedReturnTime: daysAgo(3),
        actualReturnTime:   daysAgo(3),
        status:             'Returned',
        catches: [
          { fishType: 'Mackerel', quantityKg: 80 },
          { fishType: 'Crab',     quantityKg: 15 }
        ],
        alertStatus: 'None'
      },

      // ---- Trip 4: Sagar Mitra – Returned (15 days ago trip) ----
      {
        boat:               sagarMitra._id,
        owner:              suresh._id,
        departureTime:      daysAgo(15),
        expectedReturnTime: daysAgo(12),
        actualReturnTime:   daysAgo(12),
        status:             'Returned',
        catches: [
          { fishType: 'Tuna',   quantityKg: 60 },
          { fishType: 'Prawns', quantityKg: 40 }
        ],
        alertStatus: 'None'
      },

      // ---- Trip 5: Sea Star – At Sea (active, expected return 4 hours from now) ----
      {
        boat:               seaStar._id,
        owner:              ramesh._id,
        departureTime:      hoursAgo(2),
        expectedReturnTime: hoursFromNow(4),
        status:             'At Sea',
        catches:            [],
        alertStatus:        'None'
      },

      // ---- Trip 6: Ocean King – Overdue (expected return was 2 hours ago) ----
      // alertStatus is "Open" so the harbour officer can follow up.
      {
        boat:               oceanKing._id,
        owner:              ramesh._id,
        departureTime:      hoursAgo(10),
        expectedReturnTime: hoursAgo(2),
        status:             'Overdue',
        catches:            [],
        alertStatus:        'Open'
      }
    ]);

    console.log('✓ Trips created (6)');

    // =====================================================
    // PRICES  –  common fish in Andhra Pradesh (₹/kg)
    // =====================================================

    await Price.insertMany([
      { fishType: 'Tuna',     pricePerKg: 250 },
      { fishType: 'Prawns',   pricePerKg: 350 },
      { fishType: 'Sardines', pricePerKg: 120 },
      { fishType: 'Pomfret',  pricePerKg: 400 },
      { fishType: 'Mackerel', pricePerKg: 180 },
      { fishType: 'Crab',     pricePerKg: 450 }
    ]);

    console.log('✓ Prices created (6)');

    // =====================================================
    // SUMMARY
    // =====================================================

    console.log('\n========================================');
    console.log('         SEED COMPLETED ✓              ');
    console.log('========================================');
    console.log('Login credentials:');
    console.log('  Admin     →  admin@seasafe.com     / admin123');
    console.log('  Officer   →  officer@seasafe.com   / officer123');
    console.log('  Fisherman →  ramesh@seasafe.com    / ramesh123');
    console.log('  Fisherman →  suresh@seasafe.com    / suresh123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed: ' + error.message);
    process.exit(1);
  }
}

seedDatabase();

