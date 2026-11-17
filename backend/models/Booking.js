const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  passengerName: { type: String, required: true },
  passengerPhone: { type: String, required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  seatNumbers: [{ type: Number, required: true }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'DEBIT_CARD', 'NET_BANKING'], required: true },
  paymentStatus: { type: String, enum: ['PAID', 'FAILED'], default: 'PAID' },
  journeyDate: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);