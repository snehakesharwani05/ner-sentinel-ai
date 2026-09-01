const express = require('express');
const router = express.Router();
const { analyzeRoutes, findPath } = require('../services/routingService');

// POST /api/v1/routes/analyze - Compare Fastest vs Safest Route
router.post('/analyze', (req, res, next) => {
  try {
    const { origin_id, destination_id } = req.body;

    if (!origin_id || !destination_id) {
      return res.status(400).json({ success: false, error: 'origin_id and destination_id are required' });
    }

    const originIdNum = Number(origin_id);
    const destIdNum = Number(destination_id);

    if (originIdNum === destIdNum) {
      return res.status(400).json({ success: false, error: 'Origin and destination must be different' });
    }

    const result = analyzeRoutes(originIdNum, destIdNum);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    if (err.message && err.message.includes('Invalid origin or destination location ID')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
});

// POST /api/v1/routes/optimal - Get single optimal route (mode = fastest | safest)
router.post('/optimal', (req, res, next) => {
  try {
    const { origin_id, destination_id, mode = 'safest' } = req.body;

    if (!origin_id || !destination_id) {
      return res.status(400).json({ success: false, error: 'origin_id and destination_id are required' });
    }

    const pathResult = findPath(Number(origin_id), Number(destination_id), mode);

    if (!pathResult) {
      return res.status(404).json({
        success: false,
        error: 'No accessible road route available due to critical road closures'
      });
    }

    res.json({
      success: true,
      data: pathResult
    });
  } catch (err) {
    if (err.message && err.message.includes('Invalid origin or destination location ID')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
});

module.exports = router;
