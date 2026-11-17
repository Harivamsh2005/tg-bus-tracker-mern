const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const BusPass = require('../models/BusPass');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Strict File Upload Firewall (Only PDF, JPG, PNG allowed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('FIREWALL BLOCKED: Only PDF, JPG, and PNG files are allowed!'));
  }
});

// Book Bus Ticket
router.post('/ticket', async (req, res) => {
  try {
    const { passengerName, passengerPhone, busId, seatNumbers, paymentMethod, journeyDate } = req.body;
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    const conflict = seatNumbers.some(seat => bus.bookedSeats.includes(seat));
    if (conflict) return res.status(400).json({ message: 'One or more seats already booked' });

    const totalAmount = Math.round(bus.distanceKm * bus.farePerKm * seatNumbers.length);
    const ticketId = `TGRTC-${Date.now().toString().slice(-6)}`;

    bus.bookedSeats.push(...seatNumbers);
    await bus.save();

    const booking = await Booking.create({
      ticketId,
      passengerName,
      passengerPhone,
      bus: bus._id,
      source: bus.source,
      destination: bus.destination,
      seatNumbers,
      totalAmount,
      paymentMethod,
      journeyDate
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all bookings
router.get('/tickets', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('bus').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Apply for Digital Bus Pass
router.post('/bus-pass', upload.single('idProof'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'ID Proof (PDF/Image) is mandatory' });

    const { applicantName, fatherOrGuardianName, dob, aadhaarNumber, passType, fromStation, toStation, durationMonths } = req.body;
    const baseRates = { STUDENT_GENERAL: 150, GENERAL_COMMUTER: 850, NGO_PASS: 600 };
    const feePaid = (baseRates[passType] || 500) * Number(durationMonths);

    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + Number(durationMonths));

    const newPass = await BusPass.create({
      passId: `TGPASS-${Math.floor(100000 + Math.random() * 900000)}`,
      applicantName,
      fatherOrGuardianName,
      dob,
      aadhaarNumber,
      passType,
      fromStation,
      toStation,
      durationMonths: Number(durationMonths),
      feePaid,
      idProofUrl: `/uploads/${req.file.filename}`,
      validUntil
    });

    res.status(201).json(newPass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all bus passes
router.get('/bus-passes', async (req, res) => {
  try {
    const passes = await BusPass.find().sort({ createdAt: -1 });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;