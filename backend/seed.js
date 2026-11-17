require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Bus = require('./models/Bus');
const User = require('./models/User');

const sampleBuses = [
  {
    busNumber: 'TS-03-Z-4512',
    serviceType: 'Super Luxury',
    source: 'Hanamkonda',
    destination: 'Jubilee Bus Station',
    stops: [
      { stationName: 'Hanamkonda', lat: 18.0072, lng: 79.5584, estimatedMinutes: 0 },
      { stationName: 'Kazipet', lat: 17.9784, lng: 79.5126, estimatedMinutes: 15 },
      { stationName: 'Yadagirigutta', lat: 17.5880, lng: 78.9437, estimatedMinutes: 95 },
      { stationName: 'Jubilee Bus Station', lat: 17.4486, lng: 78.4983, estimatedMinutes: 165 }
    ],
    currentLocation: { lat: 17.9784, lng: 79.5126, speedKmph: 58 },
    farePerKm: 1.8,
    distanceKm: 145
  },
  {
    busNumber: 'TS-10-Z-8821',
    serviceType: 'Super Luxury',
    source: 'Jubilee Bus Station',
    destination: 'Hanamkonda',
    stops: [
      { stationName: 'Jubilee Bus Station', lat: 17.4486, lng: 78.4983, estimatedMinutes: 0 },
      { stationName: 'Yadagirigutta', lat: 17.5880, lng: 78.9437, estimatedMinutes: 70 },
      { stationName: 'Kazipet', lat: 17.9784, lng: 79.5126, estimatedMinutes: 150 },
      { stationName: 'Hanamkonda', lat: 18.0072, lng: 79.5584, estimatedMinutes: 165 }
    ],
    currentLocation: { lat: 17.5880, lng: 78.9437, speedKmph: 62 },
    farePerKm: 1.8,
    distanceKm: 145
  },
  {
    busNumber: 'TS-03-Z-1190',
    serviceType: 'Express',
    source: 'Warangal',
    destination: 'Karimnagar',
    stops: [
      { stationName: 'Warangal', lat: 17.9689, lng: 79.5941, estimatedMinutes: 0 },
      { stationName: 'Hanamkonda', lat: 18.0072, lng: 79.5584, estimatedMinutes: 15 },
      { stationName: 'Karimnagar', lat: 18.4386, lng: 79.1288, estimatedMinutes: 105 }
    ],
    currentLocation: { lat: 18.1850, lng: 79.3500, speedKmph: 52 },
    farePerKm: 1.4,
    distanceKm: 75
  },
  {
    busNumber: 'TS-04-Z-3304',
    serviceType: 'Deluxe',
    source: 'Khammam',
    destination: 'Mahatma Gandhi Bus Station',
    stops: [
      { stationName: 'Khammam', lat: 17.2473, lng: 80.1514, estimatedMinutes: 0 },
      { stationName: 'Suryapet', lat: 17.1314, lng: 79.6336, estimatedMinutes: 65 },
      { stationName: 'Nalgonda', lat: 17.0575, lng: 79.2684, estimatedMinutes: 120 },
      { stationName: 'Mahatma Gandhi Bus Station', lat: 17.3782, lng: 78.4800, estimatedMinutes: 210 }
    ],
    currentLocation: { lat: 17.1314, lng: 79.6336, speedKmph: 55 },
    farePerKm: 1.6,
    distanceKm: 195
  },
  {
    busNumber: 'TS-16-Z-7741',
    serviceType: 'Garuda Plus',
    source: 'Nizamabad',
    destination: 'Jubilee Bus Station',
    stops: [
      { stationName: 'Nizamabad', lat: 18.6725, lng: 78.0941, estimatedMinutes: 0 },
      { stationName: 'Siddipet', lat: 18.1019, lng: 78.8520, estimatedMinutes: 110 },
      { stationName: 'Jubilee Bus Station', lat: 17.4486, lng: 78.4983, estimatedMinutes: 200 }
    ],
    currentLocation: { lat: 18.2500, lng: 78.3200, speedKmph: 68 },
    farePerKm: 2.2,
    distanceKm: 175
  }
];

const seedData = async () => {
  try {
    await connectDB();
    await Bus.deleteMany();
    await User.deleteMany();

    await Bus.insertMany(sampleBuses);
    await User.create({
      name: 'Harivamsh Admin',
      email: 'admin@tgbus.in',
      password: 'AdminPassword@2026',
      role: 'ADMIN'
    });

    console.log('Telangana Bus Routes & Admin Account Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();