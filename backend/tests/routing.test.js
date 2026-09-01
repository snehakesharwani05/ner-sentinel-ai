const test = require('node:test');
const assert = require('node:assert');
const db = require('../config/db');
const seedDatabase = require('../db/seed');
const { findPath, analyzeRoutes } = require('../services/routingService');
const { updateLocationWeather } = require('../services/weatherService');

test.before(async () => {
  await seedDatabase();
});

// Existing Tests (Preserved)
test('findPath - Guwahati (2) to Dispur (3)', () => {
  const result = findPath(2, 3, 'fastest');

  assert.notStrictEqual(result, null);
  assert.strictEqual(result.origin.name, 'Guwahati');
  assert.strictEqual(result.destination.name, 'Dispur');
  assert.strictEqual(result.totalDistanceKm, 10);
});

test('findPath - Guwahati (2) to Shillong (13)', () => {
  const result = findPath(2, 13, 'fastest');

  assert.notStrictEqual(result, null);
  assert.strictEqual(result.origin.name, 'Guwahati');
  assert.strictEqual(result.destination.name, 'Shillong');
  assert.strictEqual(result.nodesCount, 3); // Guwahati -> Nongpoh -> Shillong
});

test('analyzeRoutes - Guwahati (2) to Tawang (22) with active Sela Pass blockage', () => {
  const analysis = analyzeRoutes(2, 22);
  assert.strictEqual(typeof analysis.recommendation, 'string');
});

// Priority 2 Additions: Routing & Graph Edge-Cases

test('findPath - Blocked Origin: Direct exit roads from origin are critical_blocked', () => {
  // Block all exit segments from Guwahati (2): GS Road (2->3), NH-6 (2->12), NH-17 (2->45), NH-27 (2->5)
  const segments = db.prepare(`SELECT id FROM road_segments WHERE origin_location_id = 2 OR destination_location_id = 2`).all();
  segments.forEach(s => {
    db.prepare(`INSERT INTO disruptions (road_segment_id, disruption_type, severity, status) VALUES (?, 'roadblock', 'critical_blocked', 'active')`).run(s.id);
  });

  const result = findPath(2, 13, 'fastest');
  assert.strictEqual(result, null);

  // Clear temporary blockages
  db.prepare(`DELETE FROM disruptions WHERE disruption_type = 'roadblock'`).run();
});

test('findPath - Blocked Destination: Direct entry roads to destination are critical_blocked', () => {
  // Block all entry segments into Nathu La Pass (43): Jawaharlal Nehru Rd (40->43)
  const segments = db.prepare(`SELECT id FROM road_segments WHERE destination_location_id = 43 OR origin_location_id = 43`).all();
  segments.forEach(s => {
    db.prepare(`INSERT INTO disruptions (road_segment_id, disruption_type, severity, status) VALUES (?, 'landslide', 'critical_blocked', 'active')`).run(s.id);
  });

  const result = findPath(40, 43, 'safest');
  assert.strictEqual(result, null);

  db.prepare(`DELETE FROM disruptions WHERE description IS NULL AND disruption_type = 'landslide'`).run();
});

test('findPath - Disconnected Graph Scenario: Isolated region with no accessible path', () => {
  // Isolate Sikkim by blocking NH-10 at Rangpo (1->38)
  const rangpoSeg = db.prepare(`SELECT id FROM road_segments WHERE origin_location_id = 1 AND destination_location_id = 38`).get();
  db.prepare(`INSERT INTO disruptions (road_segment_id, disruption_type, severity, status) VALUES (?, 'flash_flood', 'critical_blocked', 'active')`).run(rangpoSeg.id);

  const result = findPath(1, 40, 'fastest'); // Siliguri to Gangtok
  assert.strictEqual(result, null);

  db.prepare(`DELETE FROM disruptions WHERE disruption_type = 'flash_flood' AND road_segment_id = ?`).run(rangpoSeg.id);
});

test('findPath - Extreme Weather Impact on Risk Scoring', () => {
  // Baseline risk score for Siliguri (1) -> Gangtok (40)
  const baseRoute = findPath(1, 40, 'safest');
  assert.notStrictEqual(baseRoute, null);

  // Update Gangtok (40) with 350mm monsoon rainfall + 0.95 landslide risk index
  updateLocationWeather(40, { rainfall_mm_24h: 350, landslide_risk_index: 0.95, flood_warning_level: 'severe' });

  const severeWeatherRoute = findPath(1, 40, 'safest');
  assert.notStrictEqual(severeWeatherRoute, null);
  assert.strictEqual(severeWeatherRoute.averageRiskScore > baseRoute.averageRiskScore, true);
});

test('findPath - Dynamic Rerouting under Multiple Simultaneous Segment Disruptions', () => {
  // Guwahati (2) to Silchar (9):
  // Segment 1: Nagaon (5) -> Haflong (10) marked critical_blocked
  // Segment 2: Jowai (15) -> Silchar (9) marked high hazard delay (+60min)
  const haflongSeg = db.prepare(`SELECT id FROM road_segments WHERE origin_location_id = 5 AND destination_location_id = 10`).get();
  const jowaiSeg = db.prepare(`SELECT id FROM road_segments WHERE origin_location_id = 15 AND destination_location_id = 9`).get();

  db.prepare(`INSERT INTO disruptions (road_segment_id, disruption_type, severity, status) VALUES (?, 'landslide', 'critical_blocked', 'active')`).run(haflongSeg.id);
  db.prepare(`INSERT INTO disruptions (road_segment_id, disruption_type, severity, status) VALUES (?, 'roadwork', 'high', 'active')`).run(jowaiSeg.id);

  const route = findPath(2, 9, 'fastest');
  assert.notStrictEqual(route, null);
  // Must avoid Haflong blocked segment and use the Meghalaya route
  const usedHaflong = route.pathNodes.some(n => n.name.includes('Haflong'));
  assert.strictEqual(usedHaflong, false);

  db.prepare(`DELETE FROM disruptions WHERE description IS NULL`).run();
});
