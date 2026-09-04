const express = require('express');
const router = express.Router();

/**
 * GET /api/v1/convoys
 * Fetches all 14 active essential supplies & disaster relief convoys.
 */
router.get('/', async (req, res) => {
  try {
    const commodity = req.query.commodity || 'ALL';
    const aiUrl = `http://127.0.0.1:5001/api/v1/ai/convoys?commodity=${commodity}`;
    
    try {
      const response = await fetch(aiUrl, { signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (err) {
      console.warn('[CONVOYS] Microservice timeout:', err.message);
    }

    return res.json({
      success: true,
      count: 0,
      data: []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/convoys/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const aiUrl = `http://127.0.0.1:5001/api/v1/ai/convoys/${req.params.id}`;
    const response = await fetch(aiUrl, { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    return res.status(404).json({ success: false, error: 'Convoy not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/convoys/trigger-reroute/:id
 * Triggers NetworkX dynamic graph recalculation for an active relief convoy.
 */
router.post('/trigger-reroute/:id', async (req, res) => {
  try {
    const aiUrl = `http://127.0.0.1:5001/api/v1/ai/convoys/trigger-reroute/${req.params.id}`;
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    return res.status(400).json({ success: false, error: 'Failed to calculate dynamic reroute' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/convoys/ping
 * Ingests real-time GPS pings from field drivers (Traccar/AIS-140).
 */
router.post('/ping', async (req, res) => {
  try {
    const pingUrl = 'http://127.0.0.1:5001/api/v1/ai/convoys/ping';
    const response = await fetch(pingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(4000)
    });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    return res.status(400).json({ success: false, error: 'Failed to ingest GPS ping' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
