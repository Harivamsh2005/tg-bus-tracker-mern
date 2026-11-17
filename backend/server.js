require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { applicationFirewall, apiLimiter } = require('./middleware/firewall');

const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const firewallRoutes = require('./routes/firewallRoutes');

const app = express();
connectDB();

// Security & Firewall Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(apiLimiter);
app.use(applicationFirewall);

// Static folder for uploaded ID proofs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/firewall', firewallRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', firewall: 'ACTIVE' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(403).json({ success: false, firewallAlert: true, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TG Bus Tracker & Firewall Server running on port ${PORT}`));