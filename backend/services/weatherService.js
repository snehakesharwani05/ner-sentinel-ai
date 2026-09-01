const db = require('../config/db');

/**
 * Base Weather Provider Adapter Interface
 * All external live weather adapters (e.g. OpenWeatherMap, IMD, AccuWeather) extend this interface.
 */
class BaseWeatherProvider {
  constructor(name = 'BaseProvider') {
    this.name = name;
  }

  /**
   * Fetches live weather for a location object { id, name, latitude, longitude }
   * @param {Object} location
   * @returns {Promise<Object>} Standardized weather payload
   */
  async fetchLiveWeather(location) {
    throw new Error('fetchLiveWeather() must be implemented by provider adapter');
  }
}

/**
 * Default / Demo Weather Provider Adapter
 * Simulates fetching live external API weather data or can be configured to trigger fallbacks.
 */
class MockExternalWeatherProvider extends BaseWeatherProvider {
  constructor() {
    super('MockExternalWeatherProvider');
    this.shouldFail = false;
  }

  setSimulateFailure(fail) {
    this.shouldFail = fail;
  }

  async fetchLiveWeather(location) {
    if (this.shouldFail) {
      throw new Error(`[WEATHER API ERROR] External weather provider '${this.name}' failed to respond`);
    }

    return {
      rainfall_mm_24h: 45.0,
      wind_speed_kmh: 18.5,
      fog_visibility_m: 8000.0,
      landslide_risk_index: 0.35,
      flood_warning_level: 'advisory'
    };
  }
}

// Active Weather Provider Adapter (Default to MockExternalWeatherProvider)
let activeProvider = new MockExternalWeatherProvider();

function setWeatherProvider(provider) {
  if (!provider || typeof provider.fetchLiveWeather !== 'function') {
    throw new Error('Invalid weather provider adapter');
  }
  activeProvider = provider;
}

function getWeatherByLocation(locationId) {
  return db.prepare(`
    SELECT w.*, l.name as location_name, l.state
    FROM weather_data w
    JOIN locations l ON w.location_id = l.id
    WHERE w.location_id = ?
    ORDER BY w.id DESC
    LIMIT 1
  `).get(locationId);
}

function getAllWeatherRecords() {
  return db.prepare(`
    SELECT w.*, l.name as location_name, l.state
    FROM weather_data w
    JOIN locations l ON w.location_id = l.id
    ORDER BY w.id DESC
  `).all();
}

function updateLocationWeather(locationId, data) {
  const { rainfall_mm_24h, wind_speed_kmh, fog_visibility_m, landslide_risk_index, flood_warning_level } = data;
  
  const stmt = db.prepare(`
    INSERT INTO weather_data (location_id, rainfall_mm_24h, wind_speed_kmh, fog_visibility_m, landslide_risk_index, flood_warning_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    locationId,
    rainfall_mm_24h || 0.0,
    wind_speed_kmh || 0.0,
    fog_visibility_m || 10000.0,
    landslide_risk_index || 0.0,
    flood_warning_level || 'none'
  );

  return getWeatherByLocation(locationId);
}

async function fetchAndUpdateLocationWeather(locationId) {
  const location = db.prepare(`SELECT * FROM locations WHERE id = ?`).get(locationId);
  if (!location) {
    throw new Error('Location not found');
  }

  try {
    const liveData = await activeProvider.fetchLiveWeather(location);
    return updateLocationWeather(locationId, liveData);
  } catch (err) {
    console.warn(`[WEATHER SERVICE FALLBACK] ${err.message}. Falling back to seeded/manual DB record.`);
    const existing = getWeatherByLocation(locationId);
    if (existing) return existing;

    return updateLocationWeather(locationId, {
      rainfall_mm_24h: 0.0,
      wind_speed_kmh: 0.0,
      fog_visibility_m: 10000.0,
      landslide_risk_index: 0.0,
      flood_warning_level: 'none'
    });
  }
}

module.exports = {
  BaseWeatherProvider,
  MockExternalWeatherProvider,
  setWeatherProvider,
  getWeatherByLocation,
  getAllWeatherRecords,
  updateLocationWeather,
  fetchAndUpdateLocationWeather
};
