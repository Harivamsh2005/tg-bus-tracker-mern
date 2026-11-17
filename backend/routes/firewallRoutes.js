const express = require('express');
const SecurityLog = require('../models/SecurityLog');
const { blockedIPs } = require('../middleware/firewall');

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ timestamp: -1 }).limit(50);
    res.json({
      activeFirewall: true,
      blockedIPs: Array.from(blockedIPs),
      totalThreatsLogged: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/block-ip', async (req, res) => {
  const { ipAddress, reason } = req.body;
  if (!ipAddress) return res.status(400).json({ message: 'IP Address required' });

  blockedIPs.add(ipAddress);
  await SecurityLog.create({
    ipAddress,
    endpoint: 'MANUAL_ADMIN_RULE',
    method: 'BLOCK',
    threatType: 'BLACKLISTED_IP',
    isBlocked: true,
    details: reason || 'Manually blocked from Security Dashboard'
  });

  res.json({ message: `IP ${ipAddress} blocked successfully`, blockedIPs: Array.from(blockedIPs) });
});

router.post('/unblock-ip', (req, res) => {
  const { ipAddress } = req.body;
  blockedIPs.delete(ipAddress);
  res.json({ message: `IP ${ipAddress} unblocked`, blockedIPs: Array.from(blockedIPs) });
});

module.exports = router;