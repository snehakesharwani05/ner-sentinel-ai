const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

// GET /api/v1/disruptions - list active/all disruptions (Public)
router.get('/', (req, res, next) => {
  try {
    const { status, severity } = req.query;
    let query = `
      SELECT d.*, 
             rs.highway_code, rs.distance_km, rs.terrain_type,
             o.name as origin_name, o.state as origin_state,
             dest.name as destination_name, dest.state as destination_state
      FROM disruptions d
      JOIN road_segments rs ON d.road_segment_id = rs.id
      JOIN locations o ON rs.origin_location_id = o.id
      JOIN locations dest ON rs.destination_location_id = dest.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    } else {
      query += ` AND d.status = 'active'`; // Default to active
    }

    if (severity) {
      query += ` AND d.severity = ?`;
      params.push(severity);
    }

    query += ` ORDER BY d.reported_at DESC`;
    const disruptions = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: disruptions.length,
      data: disruptions
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/disruptions - report new disruption (Requires admin, operator, or disaster_mgmt)
router.post('/', authenticateToken, requireRoles('admin', 'operator', 'disaster_mgmt'), (req, res, next) => {
  try {
    const { road_segment_id, disruption_type, severity, description, expected_clearance } = req.body;

    if (!road_segment_id || !disruption_type || !severity) {
      return res.status(400).json({ success: false, error: 'road_segment_id, disruption_type, and severity are required' });
    }

    const validTypes = ['landslide', 'flash_flood', 'bridge_damage', 'roadblock', 'severe_weather', 'roadwork'];
    const validSeverities = ['low', 'moderate', 'high', 'critical_blocked'];

    if (!validTypes.includes(disruption_type)) {
      return res.status(400).json({ success: false, error: `Invalid disruption_type. Expected: ${validTypes.join(', ')}` });
    }
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ success: false, error: `Invalid severity. Expected: ${validSeverities.join(', ')}` });
    }

    const stmt = db.prepare(`
      INSERT INTO disruptions (road_segment_id, disruption_type, severity, description, status, reported_by, expected_clearance)
      VALUES (?, ?, ?, ?, 'active', ?, ?)
    `);

    stmt.run(road_segment_id, disruption_type, severity, description || null, req.user.id, expected_clearance || null);

    const created = db.prepare(`
      SELECT d.*, rs.highway_code, o.name as origin_name, dest.name as destination_name
      FROM disruptions d
      JOIN road_segments rs ON d.road_segment_id = rs.id
      JOIN locations o ON rs.origin_location_id = o.id
      JOIN locations dest ON rs.destination_location_id = dest.id
      ORDER BY d.id DESC LIMIT 1
    `).get();

    res.status(201).json({
      success: true,
      message: 'Road disruption report registered successfully. Dynamic graph rerouting updated.',
      data: created
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/disruptions/:id/status - update status (Requires admin or disaster_mgmt)
router.patch('/:id/status', authenticateToken, requireRoles('admin', 'disaster_mgmt'), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['active', 'cleared', 'under_repair'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Expected: ${validStatuses.join(', ')}` });
    }

    const stmt = db.prepare(`UPDATE disruptions SET status = ? WHERE id = ?`);
    stmt.run(status, id);

    const updated = db.prepare(`SELECT * FROM disruptions WHERE id = ?`).get(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Disruption record not found' });
    }

    res.json({
      success: true,
      message: `Disruption status updated to '${status}'. Routing engine updated.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
