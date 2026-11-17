const express = require('express');
const Bus = require('../models/Bus');

const router = express.Router();

// Get all buses or filter by source & destination
router.get('/', async (req, res) => {
  try {
    const { source, destination } = req.query;
    let filter = {};
    if (source) filter.source = new RegExp(source, 'i');
    if (destination) filter.destination = new RegExp(destination, 'i');

    const buses = await Bus.find(filter);
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new bus (Operator feature)
router.post('/', async (req, res) => {
  try {
    const newBus = await Bus.create(req.body);
    res.status(201).json(newBus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Simulate Live GPS Movement for all active buses
router.post('/simulate-gps', async (req, res) => {
  try {
    const buses = await Bus.find({ status: 'ON_ROUTE' });
    for (let bus of buses) {
      const destStop = bus.stops[bus.stops.length - 1];
      if (destStop) {
        bus.currentLocation.lat += (destStop.lat - bus.currentLocation.lat) * 0.1;
        bus.currentLocation.lng += (destStop.lng - bus.currentLocation.lng) * 0.1;
        bus.currentLocation.speedKmph = Math.floor(45 + Math.random() * 25);
        bus.currentLocation.lastUpdated = new Date();
        await bus.save();
      }
    }
    const updatedBuses = await Bus.find();
    res.json({ message: 'Live GPS updated', buses: updatedBuses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;