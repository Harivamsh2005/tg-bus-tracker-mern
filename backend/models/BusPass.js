const mongoose = require('mongoose');

const busPassSchema = new mongoose.Schema({
  passId: { type: String, required: true, unique: true },
  applicantName: { type: String, required: true },
  fatherOrGuardianName: { type: String, required: true },
  dob: { type: String, required: true },
  aadhaarNumber: { type: String, required: true },
  passType: { type: String, enum: ['STUDENT_GENERAL', 'GENERAL_COMMUTER', 'NGO_PASS'], required: true },
  fromStation: { type: String, required: true },
  toStation: { type: String, required: true },
  durationMonths: { type: Number, enum: [1, 3], required: true },
  feePaid: { type: Number, required: true },
  idProofUrl: { type: String, required: true }, // PDF or Image path
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('BusPass', busPassSchema);