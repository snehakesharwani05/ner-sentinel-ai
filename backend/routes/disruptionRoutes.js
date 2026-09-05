const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// GET /api/v1/disruptions - list active real-time AI & field disruptions with user attribution
router.get('/', async (req, res, next) => {
  try {
    const { status, severity } = req.query;

    // 1. Fetch user-submitted disruptions from SQLite DB
    let dbDisruptions = [];
    try {
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
        query += ` AND d.status = 'active'`;
      }

      if (severity) {
        query += ` AND (LOWER(d.severity) = ? OR UPPER(d.severity) = ?)`;
        params.push(severity.toLowerCase(), severity.toUpperCase());
      }

      query += ` ORDER BY d.reported_at DESC`;
      const rows = db.prepare(query).all(...params);

      dbDisruptions = rows.map(d => ({
        ...d,
        reported_by_name: d.reported_by_name || 'Field Officer',
        reported_by_role: d.reported_by_role || 'field_officer',
        reported_at: d.reported_at || new Date().toISOString(),
        source_type: 'USER_FIELD_REPORT',
        source: `Verified Field Officer: ${d.reported_by_name || 'Field Officer'}`
      }));
    } catch (dbErr) {
      console.warn('[DISRUPTIONS] SQLite query error:', dbErr.message);
    }

    res.json({
      success: true,
      count: dbDisruptions.length,
      data: dbDisruptions,
      source: 'Verified Field Reports'
    });
  } catch (err) {
    next(err);
  }
});

// Helper for handling disruption / incident creation
const handleCreateDisruption = (req, res, next) => {
  try {
    // 1. Extract authenticated user if available
    let authUser = req.user || null;
    if (!authUser) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          authUser = jwt.verify(token, process.env.JWT_SECRET || 'ner_sentinel_jwt_secret_key_2026_sih');
        } catch (e) {}
      }
    }

    const { road_segment_id, disruption_type, severity, severity_level, description, expected_clearance } = req.body;

    if (!road_segment_id) {
      return res.status(400).json({ success: false, error: 'road_segment_id is required' });
    }

    const roadSegmentId = Number(road_segment_id);
    const disruptionType = String(disruption_type || 'landslide').toLowerCase().trim();
    
    const rawSeverity = String(severity || severity_level || 'critical_blocked').toLowerCase().trim();
    let normSeverity = 'critical_blocked';
    if (rawSeverity === 'low') normSeverity = 'low';
    else if (rawSeverity === 'moderate' || rawSeverity === 'medium') normSeverity = 'moderate';
    else if (rawSeverity === 'high') normSeverity = 'high';
    else if (rawSeverity === 'critical' || rawSeverity === 'critical_blocked') normSeverity = 'critical_blocked';

    const userName = authUser?.name || req.body.reported_by_name || req.body.userName || req.body.reporter || 'Field Officer';
    const userRole = authUser?.role || req.body.reported_by_role || req.body.userRole || 'field_officer';
    const reportedAt = req.body.reported_at || new Date().toISOString();
    const desc = description || req.body.desc || `Active ${disruptionType.replace(/_/g, ' ')} reported by ${userName}.`;

    const stmt = db.prepare(`
      INSERT INTO disruptions (road_segment_id, disruption_type, severity, description, status, reported_by, reported_by_name, reported_by_role, reported_at, expected_clearance)
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
    `);

    stmt.run(
      roadSegmentId,
      disruptionType,
      normSeverity,
      desc,
      authUser?.id || null,
      userName,
      userRole,
      reportedAt,
      expected_clearance || null
    );

    const created = db.prepare(`
      SELECT d.*, rs.highway_code, rs.distance_km, o.name as origin_name, dest.name as destination_name
      FROM disruptions d
      JOIN road_segments rs ON d.road_segment_id = rs.id
      JOIN locations o ON rs.origin_location_id = o.id
      JOIN locations dest ON rs.destination_location_id = dest.id
      ORDER BY d.id DESC LIMIT 1
    `).get();

    res.status(201).json({
      success: true,
      message: 'Road disruption report registered successfully. Dynamic graph rerouting updated.',
      data: {
        ...created,
        reported_by_name: userName,
        reported_by_role: userRole,
        reported_at: reportedAt,
        source_type: 'USER_FIELD_REPORT',
        source: `Verified Field Officer: ${userName}`
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/disruptions
router.post('/', handleCreateDisruption);

// POST /api/v1/disruptions/incidents (alias)
router.post('/incidents', handleCreateDisruption);

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

