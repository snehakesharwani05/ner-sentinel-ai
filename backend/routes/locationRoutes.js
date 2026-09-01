const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { buildGraph } = require('../services/routingService');

// GET /api/v1/locations/network/graph - full graph overview
router.get('/network/graph', (req, res, next) => {
  try {
    const { locationsMap, adjacencyList } = buildGraph();
    const nodes = Array.from(locationsMap.values());
    const edges = [];

    adjacencyList.forEach((adjEdges, originId) => {
      adjEdges.forEach(e => {
        edges.push(e);
      });
    });

    res.json({
      success: true,
      data: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodes,
        edges
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/locations - list all locations (with state/type filters)
router.get('/', (req, res, next) => {
  try {
    const { state, type } = req.query;
    let query = `SELECT * FROM locations WHERE 1=1`;
    const params = [];

    if (state) {
      query += ` AND state = ?`;
      params.push(state);
    }
    if (type) {
      query += ` AND location_type = ?`;
      params.push(type);
    }

    query += ` ORDER BY state, name`;
    const locations = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/locations/:id - location details + connecting road segments
router.get('/:id', (req, res, next) => {
  try {
    const locationId = Number(req.params.id);
    const location = db.prepare(`SELECT * FROM locations WHERE id = ?`).get(locationId);

    if (!location) {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }

    const connectedSegments = db.prepare(`
      SELECT rs.*, 
             o.name as origin_name, o.state as origin_state,
             d.name as destination_name, d.state as destination_state
      FROM road_segments rs
      JOIN locations o ON rs.origin_location_id = o.id
      JOIN locations d ON rs.destination_location_id = d.id
      WHERE rs.origin_location_id = ? OR rs.destination_location_id = ?
    `).all(locationId, locationId);

    res.json({
      success: true,
      data: {
        location,
        connectedSegments
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
