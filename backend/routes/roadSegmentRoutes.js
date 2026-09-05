const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/v1/road-segments
router.get("/", (req, res, next) => {
  try {
    const segments = db.prepare(`
      SELECT *
      FROM road_segments
      WHERE is_active = 1
      ORDER BY id
    `).all();

    res.json({
      success: true,
      count: segments.length,
      data: segments,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;