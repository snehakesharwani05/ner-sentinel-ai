const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const seedDatabase = require('../db/seed');
const app = require('../server');
const { JWT_SECRET } = require('../middleware/authMiddleware');

let server;
let baseUrl;

// Helper to generate tokens for different roles
function makeToken(role = 'operator', email = 'user@nersentinel.in', id = 1) {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '1h' });
}

test.before(async () => {
  await seedDatabase();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  if (server) server.close();
});

// Existing Tests (Preserved)
test('GET /health - returns system health and SQLite DB stats', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ONLINE');
  assert.strictEqual(data.database.nodesCount, 46);
});

test('GET /api/v1/locations - returns 46 NER locations', async () => {
  const res = await fetch(`${baseUrl}/api/v1/locations`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.count, 46);
});

test('POST /api/v1/routes/analyze - compares Fastest vs Safest routes', async () => {
  const res = await fetch(`${baseUrl}/api/v1/routes/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_id: 2, destination_id: 13 })
  });

  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.notStrictEqual(json.data.fastestRoute, null);
});

test('GET /api/v1/disruptions - lists active road hazards', async () => {
  const res = await fetch(`${baseUrl}/api/v1/disruptions`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.count > 0, true);
});

test('POST /api/v1/shipments - dispatches shipment package with route', async () => {
  const token = makeToken('operator');
  const res = await fetch(`${baseUrl}/api/v1/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      origin_location_id: 2,
      destination_location_id: 13,
      cargo_type: 'medicines',
      priority: 'critical',
      weight_kg: 250
    })
  });

  assert.strictEqual(res.status, 201);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.cargo_type, 'medicines');
});

// Priority 2 Additions: Authentication & JWT Verification
test('JWT Auth - Missing Authorization Header returns 401 Unauthorized', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/me`);
  assert.strictEqual(res.status, 401);
  const json = await res.json();
  assert.strictEqual(json.error, 'Access token required');
});

test('JWT Auth - Malformed/Invalid Token returns 403 Forbidden', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { 'Authorization': 'Bearer invalid_token_xyz_123' }
  });
  assert.strictEqual(res.status, 403);
  const json = await res.json();
  assert.strictEqual(json.error, 'Invalid or expired token');
});

test('JWT Auth - Expired Token returns 403 Forbidden', async () => {
  const expiredToken = jwt.sign({ id: 1, email: 'admin@nersentinel.in', role: 'admin' }, JWT_SECRET, { expiresIn: '-1s' });
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${expiredToken}` }
  });
  assert.strictEqual(res.status, 403);
});

test('JWT Auth - Valid Token returns 200 OK + User Profile', async () => {
  const adminUser = db.prepare(`SELECT id, email, role FROM users WHERE email = 'admin@nersentinel.in'`).get();
  const token = makeToken(adminUser.role, adminUser.email, adminUser.id);
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.email, 'admin@nersentinel.in');
});

// Priority 2 Additions: Role-Based Access Control (RBAC) across all 4 roles
test('RBAC - Disruption Reporting Permissions (admin, operator, disaster_mgmt vs driver)', async () => {
  const driverToken = makeToken('driver');
  const disasterToken = makeToken('disaster_mgmt');

  const driverRes = await fetch(`${baseUrl}/api/v1/disruptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${driverToken}`
    },
    body: JSON.stringify({ road_segment_id: 1, disruption_type: 'landslide', severity: 'high' })
  });
  assert.strictEqual(driverRes.status, 403);

  const disasterRes = await fetch(`${baseUrl}/api/v1/disruptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${disasterToken}`
    },
    body: JSON.stringify({ road_segment_id: 1, disruption_type: 'landslide', severity: 'high' })
  });
  assert.strictEqual(disasterRes.status, 201);
});

test('RBAC - Disruption Status Update Permissions (admin/disaster_mgmt vs operator)', async () => {
  const operatorToken = makeToken('operator');
  const adminToken = makeToken('admin');
  const disruption = db.prepare(`SELECT id FROM disruptions LIMIT 1`).get();
  assert.notStrictEqual(disruption, undefined);

  const opRes = await fetch(`${baseUrl}/api/v1/disruptions/${disruption.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${operatorToken}`
    },
    body: JSON.stringify({ status: 'cleared' })
  });
  assert.strictEqual(opRes.status, 403);

  const adminRes = await fetch(`${baseUrl}/api/v1/disruptions/${disruption.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'cleared' })
  });
  assert.strictEqual(adminRes.status, 200);
});

test('RBAC - Driver Role CAN update shipment status (driver authorized)', async () => {
  const driverToken = makeToken('driver');
  const shipment = db.prepare(`SELECT id FROM shipments LIMIT 1`).get();
  assert.notStrictEqual(shipment, undefined);

  const res = await fetch(`${baseUrl}/api/v1/shipments/${shipment.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${driverToken}`
    },
    body: JSON.stringify({ status: 'in_transit' })
  });
  assert.strictEqual(res.status, 200);
});

// Priority 2 Additions: Validation & Payload Error Handling
test('Payload Validation - Missing Required Parameters returns 400 Bad Request', async () => {
  const res = await fetch(`${baseUrl}/api/v1/routes/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_id: 2 })
  });

  assert.strictEqual(res.status, 400);
  const json = await res.json();
  assert.strictEqual(json.error, 'origin_id and destination_id are required');
});

test('Payload Validation - Identical Origin and Destination returns 400 Bad Request', async () => {
  const res = await fetch(`${baseUrl}/api/v1/routes/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_id: 2, destination_id: 2 })
  });

  assert.strictEqual(res.status, 400);
  const json = await res.json();
  assert.strictEqual(json.error, 'Origin and destination must be different');
});

test('Payload Validation - Invalid Disruption Type returns 400 Bad Request', async () => {
  const token = makeToken('admin');
  const res = await fetch(`${baseUrl}/api/v1/disruptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ road_segment_id: 1, disruption_type: 'volcano_eruption', severity: 'high' })
  });

  assert.strictEqual(res.status, 400);
});

// Priority 2 Additions: Nonexistent Locations & Resources
test('Nonexistent Resource - GET /api/v1/locations/9999 returns 404 Not Found', async () => {
  const res = await fetch(`${baseUrl}/api/v1/locations/9999`);
  assert.strictEqual(res.status, 404);
  const json = await res.json();
  assert.strictEqual(json.error, 'Location not found');
});

test('Nonexistent Resource - Invalid Origin/Destination IDs in Route calculation returns 400 Bad Request', async () => {
  const res = await fetch(`${baseUrl}/api/v1/routes/optimal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_id: 9999, destination_id: 2 })
  });

  assert.strictEqual(res.status, 400);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error, 'Invalid origin or destination location ID');
});
