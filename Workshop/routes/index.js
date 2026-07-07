var express = require('express');
var router = express.Router();
const mongoose = require('../db');

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    code: 200,
    message: 'API is running.',
    timestamp: new Date().toISOString()
  });
});

router.get('/health', async (req, res) => {
  try {
    // Ping MongoDB
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      success: true,
      code: 200,
      message: 'API is healthy.',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    res.status(503).json({
      success: false,
      code: 503,
      message: 'Database unavailable.',
      database: 'Disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;