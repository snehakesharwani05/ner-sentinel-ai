const test = require('node:test');
const assert = require('node:assert');
const db = require('../config/db');
const seedDatabase = require('../db/seed');
const {
  MockExternalWeatherProvider,
  setWeatherProvider,
  getWeatherByLocation,
  fetchAndUpdateLocationWeather
} = require('../services/weatherService');

test.before(async () => {
  await seedDatabase();
});

test('Weather Service - Mock Provider Live Fetch & DB Persistence', async () => {
  const provider = new MockExternalWeatherProvider();
  setWeatherProvider(provider);

  // Sync weather for Gangtok (Location 40)
  const result = await fetchAndUpdateLocationWeather(40);

  assert.notStrictEqual(result, undefined);
  assert.strictEqual(result.location_id, 40);
  assert.strictEqual(result.rainfall_mm_24h, 45.0);
  assert.strictEqual(result.flood_warning_level, 'advisory');

  // Verify DB record is persisted
  const dbRecord = getWeatherByLocation(40);
  assert.strictEqual(dbRecord.rainfall_mm_24h, 45.0);
});

test('Weather Service - External Provider Failure Graceful Fallback to DB', async () => {
  const provider = new MockExternalWeatherProvider();
  provider.setSimulateFailure(true); // Simulate 500/timeout network error from live API
  setWeatherProvider(provider);

  // Sync weather for Shillong (Location 13) which has seeded DB record
  const fallbackRecord = await fetchAndUpdateLocationWeather(13);

  assert.notStrictEqual(fallbackRecord, undefined);
  assert.strictEqual(fallbackRecord.location_id, 13);
  // Verify it returned seeded DB weather instead of throwing unhandled exception
  assert.strictEqual(typeof fallbackRecord.rainfall_mm_24h, 'number');
});
