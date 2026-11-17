const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  threatType: { 
    type: String, 
    enum: ['RATE_LIMIT_EXCEEDED', 'BLACKLISTED_IP', 'INJECTION_ATTEMPT', 'UNAUTHORIZED_ACCESS'],
    required: true 
  },
  isBlocked: { type: Boolean, default: false },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SecurityLog', securityLogSchema);