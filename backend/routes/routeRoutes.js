const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { analyzeRoutesAsync, findPathAsync } = require('../services/routingService');

// GET /api/v1/routes/segments - List all road corridors with names
router.get('/segments', (req, res, next) => {
  try {
    const segments = db.prepare(`
      SELECT rs.id, rs.highway_code, rs.distance_km, rs.terrain_type, rs.road_condition,
             o.id as origin_id, o.name as origin_name, o.state as origin_state,
             d.id as destination_id, d.name as destination_name, d.state as destination_state
      FROM road_segments rs
      JOIN locations o ON rs.origin_location_id = o.id
      JOIN locations d ON rs.destination_location_id = d.id
      ORDER BY rs.highway_code, o.name
    `).all();

    res.json({
      success: true,
      count: segments.length,
      data: segments
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/routes/analyze - Compare Fastest vs Safest Route with Real-Time AI Predictions
router.post('/analyze', async (req, res, next) => {
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

    const result = await analyzeRoutesAsync(originIdNum, destIdNum);

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
router.post('/optimal', async (req, res, next) => {
  try {
    const { origin_id, destination_id, mode = 'safest' } = req.body;

    if (!origin_id || !destination_id) {
      return res.status(400).json({ success: false, error: 'origin_id and destination_id are required' });
    }

    const pathResult = await findPathAsync(Number(origin_id), Number(destination_id), mode);

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

// POST /api/v1/routes/simulate - Run live geotechnical ML hazard simulation
router.post('/simulate', async (req, res, next) => {
  try {
    const { target_location, origin_location, rainfall_mm, soil_moisture, jam_factor } = req.body;

    const aiUrl = process.env.AI_ENGINE_URL ? process.env.AI_ENGINE_URL.replace('/ai/analyze', '/ai/simulate') : 'http://127.0.0.1:5001/api/v1/ai/simulate';
    const aiRes = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_location: target_location || 'Sela Pass',
        origin_location: origin_location || 'Guwahati',
        rainfall_mm: rainfall_mm !== undefined && rainfall_mm !== null ? Number(rainfall_mm) : 200,
        soil_moisture: soil_moisture !== undefined && soil_moisture !== null ? Number(soil_moisture) : 0.42,
        jam_factor: jam_factor !== undefined && jam_factor !== null ? Number(jam_factor) : 3.0
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (aiRes.ok) {
      const simData = await aiRes.json();
      return res.json(simData);
    }

    res.status(500).json({ success: false, error: 'AI Simulation service returned an error' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
