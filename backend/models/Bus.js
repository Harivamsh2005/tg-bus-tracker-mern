const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true }, // e.g., TS-03-Z-4512
  serviceType: { 
    type: String, 
    enum: ['Palle Velugu', 'Express', 'Deluxe', 'Super Luxury', 'Garuda Plus'], 
    required: true 
  },
  source: { type: String, required: true },      // e.g., Hanamkonda
  destination: { type: String, required: true }, // e.g., Jubilee Bus Station
  stops: [{
    stationName: String,
    lat: Number,
    lng: Number,
    estimatedMinutes: Number
  }],
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speedKmph: { type: Number, default: 45 },
    lastUpdated: { type: Date, default: Date.now }
  },
  totalSeats: { type: Number, default: 40 },
  bookedSeats: [{ type: Number }],
  farePerKm: { type: Number, default: 1.5 },
  distanceKm: { type: Number, required: true },
  status: { type: String, enum: ['ON_ROUTE', 'SCHEDULED', 'DELAYED', 'COMPLETED'], default: 'ON_ROUTE' }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);