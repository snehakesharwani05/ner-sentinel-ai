const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// GET /api/v1/weather - list all weather records
router.get('/', (req, res, next) => {
  try {
    const records = weatherService.getAllWeatherRecords();
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/weather/:locationId - get weather for location
router.get('/:locationId', (req, res, next) => {
  try {
    const locationId = Number(req.params.locationId);
    const weather = weatherService.getWeatherByLocation(locationId);

    if (!weather) {
      return res.status(404).json({ success: false, error: 'No weather records found for this location' });
    }

    res.json({
      success: true,
      data: weather
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/weather/sync/:locationId - trigger live provider fetch & DB sync
router.post('/sync/:locationId', async (req, res, next) => {
  try {
    const locationId = Number(req.params.locationId);
    const updated = await weatherService.fetchAndUpdateLocationWeather(locationId);

    res.json({
      success: true,
      message: 'Weather synced with provider adapter and persisted to DB successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/weather - manual update weather data for location
router.post('/', (req, res, next) => {
  try {
    const { location_id, rainfall_mm_24h, wind_speed_kmh, fog_visibility_m, landslide_risk_index, flood_warning_level } = req.body;

    if (!location_id) {
      return res.status(400).json({ success: false, error: 'location_id is required' });
    }

    const updated = weatherService.updateLocationWeather(Number(location_id), {
      rainfall_mm_24h,
      wind_speed_kmh,
      fog_visibility_m,
      landslide_risk_index,
      flood_warning_level
    });

    res.status(201).json({
      success: true,
      message: 'Weather hazard metrics updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
