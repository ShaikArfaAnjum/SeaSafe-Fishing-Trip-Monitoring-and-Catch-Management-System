// Database seed script to populate and ensure demo accounts and sample data idempotently
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User  = require('./models/User');
const Boat  = require('./models/Boat');
const Trip  = require('./models/Trip');
const Price = require('./models/Price');

// Helper functions for relative dates
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// Populate / update database idempotently without deleting existing operational records
async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Running idempotent seeding...');

    const salt = await bcrypt.genSalt(10);

    // 1. Upsert Demo Accounts with exact requested credentials
    const demoAccounts = [
      {
        email: 'fisherman@seasafe.com',
        passwordRaw: 'Fisherman@123',
        name: 'Ramesh Kumar',
        role: 'fisherman'
      },
      {
        email: 'officer@seasafe.com',
        passwordRaw: 'Officer@123',
        name: 'Ravi Teja',
        role: 'officer'
      },
      {
        email: 'admin@seasafe.com',
        passwordRaw: 'Admin@123',
        name: 'Vikram Sharma',
        role: 'admin'
      }
    ];

    const seededUsers = {};

    for (const acc of demoAccounts) {
      const hashedPassword = await bcrypt.hash(acc.passwordRaw, salt);
      const user = await User.findOneAndUpdate(
        { email: acc.email.toLowerCase() },
        {
          $set: {
            name: acc.name,
            password: hashedPassword,
            role: acc.role
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededUsers[acc.role] = user;
      console.log(`✓ Account verified/updated: ${acc.email} (${acc.role})`);
    }

    const demoFisherman = seededUsers['fisherman'];

    // Also preserve existing demo accounts if present
    const additionalAccounts = [
      { email: 'ramesh@seasafe.com', passwordRaw: 'ramesh123', name: 'Ramesh Kumar', role: 'fisherman' },
      { email: 'suresh@seasafe.com', passwordRaw: 'suresh123', name: 'Suresh Babu', role: 'fisherman' }
    ];

    for (const acc of additionalAccounts) {
      const existing = await User.findOne({ email: acc.email.toLowerCase() });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(acc.passwordRaw, salt);
        await User.create({
          name: acc.name,
          email: acc.email.toLowerCase(),
          password: hashedPassword,
          role: acc.role
        });
        console.log(`✓ Preserved account initialized: ${acc.email}`);
      }
    }

    // 2. Associate existing boats and ensure demo fisherman has boats
    const boatDefinitions = [
      {
        boatName: 'Sea Star',
        registrationNumber: 'AP-VZ-001',
        harbour: 'Visakhapatnam',
        owner: demoFisherman._id,
        crew: [
          { name: 'Venkata Rao', age: 45, phone: '+91 98765 43210' },
          { name: 'Srinivas Reddy', age: 32, phone: '+91 87654 32109' }
        ],
        emergencyContactName: 'Kamala Devi',
        emergencyContactPhone: '+91 76543 21098'
      },
      {
        boatName: 'Ocean King',
        registrationNumber: 'AP-KK-002',
        harbour: 'Kakinada',
        owner: demoFisherman._id,
        crew: [
          { name: 'Lakshmi Narayana', age: 50, phone: '+91 65432 10987' },
          { name: 'Ravi Babu', age: 28, phone: '+91 54321 09876' },
          { name: 'Kiran Kumar', age: 35, phone: '+91 43210 98765' }
        ],
        emergencyContactName: 'Sarada Devi',
        emergencyContactPhone: '+91 32109 87654'
      },
      {
        boatName: 'Blue Wave',
        registrationNumber: 'AP-MP-003',
        harbour: 'Machilipatnam',
        crew: [
          { name: 'Murali Krishna', age: 42, phone: '+91 21098 76543' },
          { name: 'Prasad Rao', age: 38, phone: '+91 10987 65432' }
        ],
        emergencyContactName: 'Nirmala Devi',
        emergencyContactPhone: '+91 99887 76655'
      },
      {
        boatName: 'Sagar Mitra',
        registrationNumber: 'AP-VZ-004',
        harbour: 'Visakhapatnam',
        crew: [
          { name: 'Anand Rao', age: 55, phone: '+91 88776 65544' },
          { name: 'Subbaiah', age: 33, phone: '+91 77665 54433' },
          { name: 'Nageswara Rao', age: 27, phone: '+91 66554 43322' }
        ],
        emergencyContactName: 'Padmavathi',
        emergencyContactPhone: '+91 55443 32211'
      }
    ];

    const seededBoats = {};
    for (const b of boatDefinitions) {
      const existingBoat = await Boat.findOne({ registrationNumber: b.registrationNumber });
      if (existingBoat) {
        if (b.owner) {
          existingBoat.owner = b.owner;
          await existingBoat.save();
        }
        seededBoats[b.registrationNumber] = existingBoat;
      } else {
        const newBoat = await Boat.create({
          ...b,
          owner: b.owner || demoFisherman._id
        });
        seededBoats[b.registrationNumber] = newBoat;
      }
    }
    console.log(`✓ Boats verified & associated with demo accounts (Total: ${Object.keys(seededBoats).length})`);

    // 3. Associate or seed sample trips for demo accounts
    const seaStar = seededBoats['AP-VZ-001'];
    const oceanKing = seededBoats['AP-KK-002'];

    if (seaStar) {
      await Trip.updateMany({ boat: seaStar._id }, { $set: { owner: demoFisherman._id } });
    }
    if (oceanKing) {
      await Trip.updateMany({ boat: oceanKing._id }, { $set: { owner: demoFisherman._id } });
    }

    const tripCount = await Trip.countDocuments();
    if (tripCount === 0 && seaStar && oceanKing) {
      await Trip.insertMany([
        {
          boat: seaStar._id,
          owner: demoFisherman._id,
          departureTime: daysAgo(7),
          expectedReturnTime: daysAgo(5),
          actualReturnTime: daysAgo(5),
          status: 'Returned',
          catches: [
            { fishType: 'Tuna', quantityKg: 50 },
            { fishType: 'Prawns', quantityKg: 30 }
          ],
          alertStatus: 'None'
        },
        {
          boat: oceanKing._id,
          owner: demoFisherman._id,
          departureTime: daysAgo(10),
          expectedReturnTime: daysAgo(8),
          actualReturnTime: daysAgo(8),
          status: 'Returned',
          catches: [
            { fishType: 'Sardines', quantityKg: 100 },
            { fishType: 'Pomfret', quantityKg: 20 }
          ],
          alertStatus: 'None'
        },
        {
          boat: seaStar._id,
          owner: demoFisherman._id,
          departureTime: hoursAgo(2),
          expectedReturnTime: hoursFromNow(4),
          status: 'At Sea',
          catches: [],
          alertStatus: 'None'
        },
        {
          boat: oceanKing._id,
          owner: demoFisherman._id,
          departureTime: hoursAgo(10),
          expectedReturnTime: hoursAgo(2),
          status: 'Overdue',
          catches: [],
          alertStatus: 'Open'
        }
      ]);
      console.log('✓ Initial sample trips seeded for demo fisherman');
    } else {
      console.log(`✓ Preserved existing trip records (Total: ${tripCount})`);
    }

    // 4. Ensure Fish Prices
    const defaultPrices = [
      { fishType: 'Tuna', pricePerKg: 250 },
      { fishType: 'Prawns', pricePerKg: 350 },
      { fishType: 'Sardines', pricePerKg: 120 },
      { fishType: 'Pomfret', pricePerKg: 400 },
      { fishType: 'Mackerel', pricePerKg: 180 },
      { fishType: 'Crab', pricePerKg: 450 }
    ];

    for (const p of defaultPrices) {
      await Price.findOneAndUpdate(
        { fishType: p.fishType },
        { $setOnInsert: { pricePerKg: p.pricePerKg } },
        { upsert: true }
      );
    }
    console.log('✓ Fish prices verified and available');

    console.log('\nIdempotent seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
