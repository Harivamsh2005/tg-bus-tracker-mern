const rateLimit = require('express-rate-limit');
const SecurityLog = require('../models/SecurityLog');

// In-memory blocked IPs set (Admin dashboard nunchi dynamically add/remove cheyochu)
const blockedIPs = new Set();

// 1. Custom IP & Payload Inspection Firewall
const applicationFirewall = async (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Check if IP is manually or auto-blocked
  if (blockedIPs.has(clientIp)) {
    return res.status(403).json({
      success: false,
      firewallAlert: true,
      message: 'ACCESS DENIED: Your IP has been blocked by the Security Firewall.'
    });
  }

  // Inspect payload/query for basic SQL/NoSQL injection patterns
  const rawPayload = JSON.stringify({ body: req.body, query: req.query, params: req.params });
  const maliciousPatterns = /(\$where|\$ne|\$gt|\$regex|<script>|DROP TABLE|UNION SELECT)/i;

  if (maliciousPatterns.test(rawPayload)) {
    await SecurityLog.create({
      ipAddress: clientIp,
      endpoint: req.originalUrl,
      method: req.method,
      threatType: 'INJECTION_ATTEMPT',
      isBlocked: true,
      details: `Malicious payload detected: ${rawPayload.substring(0, 150)}`
    });

    return res.status(403).json({
      success: false,
      firewallAlert: true,
      message: 'FIREWALL BLOCKED: Malicious payload / injection pattern detected.'
    });
  }

  next();
};

// 2. API Rate Limiter (Brute-force & DDoS Protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 mins per IP
  handler: async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    await SecurityLog.create({
      ipAddress: clientIp,
      endpoint: req.originalUrl,
      method: req.method,
      threatType: 'RATE_LIMIT_EXCEEDED',
      isBlocked: false,
      details: 'Exceeded 100 requests in 15 minutes window'
    });

    res.status(429).json({
      success: false,
      firewallAlert: true,
      message: 'FIREWALL RATE LIMIT: Too many requests. Try again later.'
    });
  }
});

module.exports = { applicationFirewall, apiLimiter, blockedIPs };