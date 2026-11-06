// Database seed script to populate sample data
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User  = require('./models/User');
const Boat  = require('./models/Boat');
const Trip  = require('./models/Trip');
const Price = require('./models/Price');

// Helper to return date hours before now
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

// Helper to return date hours after now
function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Helper to return date days before now
function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// Populate database with sample users, boats, trips and fish prices
async function seedDatabase() {
  try {
    await connectDB();

    console.log('\nClearing existing data...');
    // Delete existing records before seeding
    await Trip.deleteMany({});
    await Boat.deleteMany({});
    await User.deleteMany({});
    await Price.deleteMany({});
    console.log('Old data cleared.\n');

    // Hash passwords for sample users
    const salt = await bcrypt.genSalt(10);
    const hashedAdmin   = await bcrypt.hash('admin123',   salt);
    const hashedOfficer = await bcrypt.hash('officer123', salt);
    const hashedRamesh  = await bcrypt.hash('ramesh123',  salt);
    const hashedSuresh  = await bcrypt.hash('suresh123',  salt);

    // Insert sample users
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

    const ramesh = users[2];
    const suresh = users[3];
    console.log('✓ Users created (4)');

    // Insert sample boats across Andhra Pradesh harbours
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

    const seaStar   = boats[0];
    const oceanKing = boats[1];
    const blueWave  = boats[2];
    const sagarMitra = boats[3];
    console.log('✓ Boats created (4)');

    // Insert sample trips with varied statuses (Returned, At Sea, Overdue)
    await Trip.insertMany([
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
      {
        boat:               seaStar._id,
        owner:              ramesh._id,
        departureTime:      hoursAgo(2),
        expectedReturnTime: hoursFromNow(4),
        status:             'At Sea',
        catches:            [],
        alertStatus:        'None'
      },
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

    // Insert current fish prices for Andhra Pradesh
    await Price.insertMany([
      { fishType: 'Tuna',     pricePerKg: 250 },
      { fishType: 'Prawns',   pricePerKg: 350 },
      { fishType: 'Sardines', pricePerKg: 120 },
      { fishType: 'Pomfret',  pricePerKg: 400 },
      { fishType: 'Mackerel', pricePerKg: 180 },
      { fishType: 'Crab',     pricePerKg: 450 }
    ]);

    console.log('✓ Prices created (6)');

    console.log('\nSeed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed: ' + error.message);
    process.exit(1);
  }
}

seedDatabase();
