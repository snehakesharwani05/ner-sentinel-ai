const test = require('node:test');
const assert = require('node:assert');
const { evaluateSegmentRisk, getSeverityBand } = require('../services/riskService');

test('evaluateSegmentRisk - baseline plain terrain with no hazards (Score 0.00, Low)', () => {
  const segment = { terrain_type: 'plain', road_condition: 'good' };
  const result = evaluateSegmentRisk(segment, null, null);

  assert.strictEqual(result.isBlocked, false);
  assert.strictEqual(result.riskScore, 0.00);
  assert.strictEqual(result.severityBand, 'Low');
});

test('evaluateSegmentRisk - hilly terrain + fair condition + moderate disruption (Score ~0.31, Moderate)', () => {
  const segment = { terrain_type: 'hilly', road_condition: 'fair' };
  const disruption = { status: 'active', severity: 'moderate' };
  const result = evaluateSegmentRisk(segment, disruption, null);

  // terrain: 0.35 * 0.25 = 0.0875
  // condition: 0.35 * 0.20 = 0.0700
  // disruption: 0.50 * 0.30 = 0.1500
  // total = 0.3075 -> 0.31
  assert.strictEqual(result.isBlocked, false);
  assert.strictEqual(result.riskScore, 0.31);
  assert.strictEqual(result.severityBand, 'Moderate');
});

test('evaluateSegmentRisk - steep mountain + poor condition + heavy rain (Score ~0.74, High)', () => {
  const segment = { terrain_type: 'steep_mountain', road_condition: 'poor' };
  const disruption = { status: 'active', severity: 'high' };
  const weather = { rainfall_mm_24h: 160, landslide_risk_index: 0.8 };
  const result = evaluateSegmentRisk(segment, disruption, weather);

  // terrain: 0.70 * 0.25 = 0.175
  // condition: 0.70 * 0.20 = 0.140
  // disruption: 0.75 * 0.30 = 0.225
  // weather: min(1.0, 0.5*(160/200) + 0.5*(0.8)) = min(1.0, 0.4 + 0.4) = 0.8 -> 0.8 * 0.25 = 0.200
  // total = 0.175 + 0.140 + 0.225 + 0.200 = 0.74
  assert.strictEqual(result.isBlocked, false);
  assert.strictEqual(result.riskScore, 0.74);
  assert.strictEqual(result.severityBand, 'High');
});

test('evaluateSegmentRisk - high pass + critical road + max weather + high disruption (Score 0.92, Critical)', () => {
  const segment = { terrain_type: 'high_pass', road_condition: 'critical' };
  const disruption = { status: 'active', severity: 'high' };
  const weather = { rainfall_mm_24h: 250, landslide_risk_index: 1.0 };
  const result = evaluateSegmentRisk(segment, disruption, weather);

  // terrain: 1.0 * 0.25 = 0.25
  // condition: 1.0 * 0.20 = 0.20
  // disruption: 0.75 * 0.30 = 0.225
  // weather: 1.0 * 0.25 = 0.25
  // total = 0.925 -> 0.92
  assert.strictEqual(result.isBlocked, false);
  assert.strictEqual(result.riskScore, 0.92);
  assert.strictEqual(result.severityBand, 'Critical');
});

test('evaluateSegmentRisk - critical blocked disruption (isBlocked = true)', () => {
  const segment = { terrain_type: 'high_pass', road_condition: 'fair' };
  const disruption = { status: 'active', severity: 'critical_blocked' };
  const result = evaluateSegmentRisk(segment, disruption, null);

  assert.strictEqual(result.isBlocked, true);
  assert.strictEqual(result.riskScore, Infinity);
  assert.strictEqual(result.severityBand, 'Critical');
});

test('getSeverityBand - boundary thresholds', () => {
  assert.strictEqual(getSeverityBand(0.10), 'Low');
  assert.strictEqual(getSeverityBand(0.25), 'Moderate');
  assert.strictEqual(getSeverityBand(0.50), 'High');
  assert.strictEqual(getSeverityBand(0.75), 'Critical');
  assert.strictEqual(getSeverityBand(1.00), 'Critical');
});
