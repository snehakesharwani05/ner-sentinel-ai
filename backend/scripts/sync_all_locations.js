const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function syncAll() {
  await db.init();
  const modelDataDir = path.join(__dirname, '../../ai-engine/model_data');
  const stateDirs = fs.readdirSync(modelDataDir).filter(d => fs.statSync(path.join(modelDataDir, d)).isDirectory());

  console.log('[SYNC] Reading expanded state JSONs from:', modelDataDir);

  const allLocations = [];
  const allSegments = [];
  const locMapByName = new Map();

  // First pass: collect all locations
  for (const sd of stateDirs) {
    const locFile = path.join(modelDataDir, sd, 'locations.json');
    if (fs.existsSync(locFile)) {
      const locs = JSON.parse(fs.readFileSync(locFile, 'utf8'));
      for (const loc of locs) {
        if (!locMapByName.has(loc.name)) {
          locMapByName.set(loc.name, loc);
          allLocations.push(loc);
        }
      }
    }
  }

  // Insert/update locations in SQLite
  console.log(`[SYNC] Inserting ${allLocations.length} locations into SQLite database...`);
  db.exec(`CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    elevation_m INTEGER DEFAULT 0,
    location_type TEXT DEFAULT 'district_hq',
    is_verified_seed INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const nameToDbId = new Map();
  for (const loc of allLocations) {
    const existing = db.prepare(`SELECT id FROM locations WHERE name = ?`).get(loc.name);
    let locId;
    if (existing) {
      locId = existing.id;
      db.prepare(`UPDATE locations SET state = ?, latitude = ?, longitude = ?, elevation_m = ?, location_type = ? WHERE id = ?`).run(
        loc.state, loc.latitude, loc.longitude, loc.elevation_m || 0, loc.location_type || 'district_hq', locId
      );
    } else {
      db.prepare(`INSERT INTO locations (name, state, latitude, longitude, elevation_m, location_type, is_verified_seed) VALUES (?, ?, ?, ?, ?, ?, 1)`).run(
        loc.name, loc.state, loc.latitude, loc.longitude, loc.elevation_m || 0, loc.location_type || 'district_hq'
      );
      const inserted = db.prepare(`SELECT id FROM locations WHERE name = ?`).get(loc.name);
      locId = inserted.id;
    }
    nameToDbId.set(loc.name, locId);
  }

  // Second pass: collect all road segments and resolve origin/dest IDs
  for (const sd of stateDirs) {
    const segFile = path.join(modelDataDir, sd, 'road_segments.json');
    if (fs.existsSync(segFile)) {
      const segs = JSON.parse(fs.readFileSync(segFile, 'utf8'));
      for (const seg of segs) {
        const origId = nameToDbId.get(seg.origin);
        const destId = nameToDbId.get(seg.destination);
        if (origId && destId) {
          allSegments.push({
            highway_code: seg.highway,
            origin_location_id: origId,
            destination_location_id: destId,
            distance_km: seg.distance_km,
            base_transit_time_min: seg.time_min,
            terrain_type: seg.terrain || 'plain',
            road_condition: seg.condition || 'good'
          });
        }
      }
    }
  }

  console.log(`[SYNC] Inserting ${allSegments.length} road segments into SQLite database...`);
  db.exec(`CREATE TABLE IF NOT EXISTS road_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    highway_code TEXT NOT NULL,
    origin_location_id INTEGER NOT NULL,
    destination_location_id INTEGER NOT NULL,
    distance_km REAL NOT NULL,
    base_transit_time_min INTEGER NOT NULL,
    terrain_type TEXT DEFAULT 'plain',
    road_condition TEXT DEFAULT 'good',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (origin_location_id) REFERENCES locations (id),
    FOREIGN KEY (destination_location_id) REFERENCES locations (id)
  )`);

  for (const seg of allSegments) {
    const existing = db.prepare(`SELECT id FROM road_segments WHERE origin_location_id = ? AND destination_location_id = ?`).get(
      seg.origin_location_id, seg.destination_location_id
    );
    if (existing) {
      db.prepare(`UPDATE road_segments SET highway_code = ?, distance_km = ?, base_transit_time_min = ?, terrain_type = ?, road_condition = ? WHERE id = ?`).run(
        seg.highway_code, seg.distance_km, seg.base_transit_time_min, seg.terrain_type, seg.road_condition, existing.id
      );
    } else {
      db.prepare(`INSERT INTO road_segments (highway_code, origin_location_id, destination_location_id, distance_km, base_transit_time_min, terrain_type, road_condition) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        seg.highway_code, seg.origin_location_id, seg.destination_location_id, seg.distance_km, seg.base_transit_time_min, seg.terrain_type, seg.road_condition
      );
    }
  }

  const finalLocCount = db.prepare(`SELECT COUNT(*) as count FROM locations`).get()?.count;
  const finalSegCount = db.prepare(`SELECT COUNT(*) as count FROM road_segments`).get()?.count;
  console.log(`[SYNC SUCCESS] SQLite now contains ${finalLocCount} locations and ${finalSegCount} road segments.`);
}

syncAll().catch(err => {
  console.error('[SYNC ERROR]', err);
  process.exit(1);
});
