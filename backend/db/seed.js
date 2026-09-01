const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  await db.init();

  console.log('Initializing database schema...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schemaSql);

  console.log('Clearing existing data...');
  db.exec(`
    DELETE FROM shipments;
    DELETE FROM weather_data;
    DELETE FROM disruptions;
    DELETE FROM road_segments;
    DELETE FROM locations;
    DELETE FROM users;
  `);

  console.log('Seeding demo users...');
  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('admin123', salt);
  const operatorPass = bcrypt.hashSync('operator123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
  `);

  insertUser.run('System Admin', 'admin@nersentinel.in', adminPass, 'admin');
  insertUser.run('Logistics Operator', 'operator@nersentinel.in', operatorPass, 'operator');
  insertUser.run('Disaster Response Officer', 'disaster@nersentinel.in', operatorPass, 'disaster_mgmt');
  insertUser.run('Field Driver', 'driver@nersentinel.in', operatorPass, 'driver');

  console.log('Seeding 46 audited NER locations...');
  const insertLocation = db.prepare(`
    INSERT INTO locations (id, name, state, latitude, longitude, elevation_m, location_type, is_verified_seed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const locations = [
    // Gateway / West Bengal (Verified)
    [1, 'Siliguri', 'West Bengal', 26.7271, 88.3953, 122, 'logistics_hub', 1],
    
    // Assam (Verified Capitals & Core Hubs)
    [2, 'Guwahati', 'Assam', 26.1445, 91.7362, 55, 'state_capital', 1],
    [3, 'Dispur', 'Assam', 26.1433, 91.7898, 55, 'state_capital', 1],
    [4, 'Tezpur', 'Assam', 26.6528, 92.7926, 48, 'logistics_hub', 1],
    [5, 'Nagaon', 'Assam', 26.3452, 92.6835, 52, 'district_hq', 1],
    [6, 'Jorhat', 'Assam', 26.7509, 94.2037, 116, 'logistics_hub', 1],
    [7, 'Dibrugarh', 'Assam', 27.4728, 94.9120, 108, 'logistics_hub', 1],
    [8, 'Tinsukia', 'Assam', 27.4922, 95.3558, 116, 'district_hq', 1],
    [9, 'Silchar', 'Assam', 24.8333, 92.7789, 35, 'logistics_hub', 1],
    [10, 'Haflong (Jatinga)', 'Assam', 25.1804, 93.0169, 512, 'mountain_pass', 1],
    [11, 'Bhalukpong', 'Assam', 27.0125, 92.6416, 213, 'border_checkpost', 1],

    // Meghalaya (Verified)
    [12, 'Nongpoh', 'Meghalaya', 25.9039, 91.8816, 485, 'district_hq', 1],
    [13, 'Shillong', 'Meghalaya', 25.5788, 91.8933, 1525, 'state_capital', 1],
    [14, 'Cherrapunji (Sohra)', 'Meghalaya', 25.2702, 91.7323, 1484, 'remote_village', 1],
    [15, 'Jowai', 'Meghalaya', 25.4527, 92.2039, 1380, 'district_hq', 1],
    [16, 'Tura', 'Meghalaya', 25.5141, 90.2032, 349, 'logistics_hub', 1],

    // Arunachal Pradesh (Verified High Altitude & Border Nodes)
    [17, 'Itanagar', 'Arunachal Pradesh', 27.0844, 93.6053, 320, 'state_capital', 1],
    [18, 'Naharlagun', 'Arunachal Pradesh', 27.1064, 93.6931, 200, 'logistics_hub', 1],
    [19, 'Bomdila', 'Arunachal Pradesh', 27.2646, 92.4159, 2415, 'district_hq', 1],
    [20, 'Dirang', 'Arunachal Pradesh', 27.3592, 92.2392, 1560, 'district_hq', 1],
    [21, 'Sela Pass', 'Arunachal Pradesh', 27.5050, 92.1058, 4170, 'mountain_pass', 1],
    [22, 'Tawang', 'Arunachal Pradesh', 27.5861, 91.8594, 3048, 'border_checkpost', 1],
    [23, 'Pasighat', 'Arunachal Pradesh', 28.0661, 95.3262, 155, 'logistics_hub', 1],

    // Nagaland (Verified)
    [24, 'Dimapur', 'Nagaland', 25.9060, 93.7271, 145, 'logistics_hub', 1],
    [25, 'Kohima', 'Nagaland', 25.6751, 94.1086, 1444, 'state_capital', 1],
    [26, 'Mokokchung', 'Nagaland', 26.3242, 94.5204, 1325, 'district_hq', 1],

    // Manipur (Verified)
    [27, 'Senapati', 'Manipur', 25.2683, 94.0186, 1100, 'district_hq', 1],
    [28, 'Imphal', 'Manipur', 24.8170, 93.9368, 786, 'state_capital', 1],
    [29, 'Churachandpur', 'Manipur', 24.3333, 93.6833, 914, 'district_hq', 1],
    [30, 'Jiribam', 'Manipur', 24.8014, 93.1186, 42, 'border_checkpost', 1],

    // Mizoram (Verified)
    [31, 'Kolasib', 'Mizoram', 24.2263, 92.6769, 680, 'district_hq', 1],
    [32, 'Aizawl', 'Mizoram', 23.7271, 92.7176, 1132, 'state_capital', 1],
    [33, 'Lunglei', 'Mizoram', 22.8872, 92.7340, 722, 'district_hq', 1],

    // Tripura (Verified)
    [34, 'Churaibari', 'Tripura', 24.4321, 92.2451, 45, 'border_checkpost', 1],
    [35, 'Dharmanagar', 'Tripura', 24.3739, 92.1642, 38, 'district_hq', 1],
    [36, 'Agartala', 'Tripura', 23.8315, 91.2868, 12, 'state_capital', 1],
    [37, 'Udaipur (Tripura)', 'Tripura', 23.5333, 91.4833, 22, 'district_hq', 1],

    // Sikkim (Verified High Altitude & Border Nodes)
    [38, 'Rangpo', 'Sikkim', 27.1764, 88.5303, 330, 'border_checkpost', 1],
    [39, 'Singtam', 'Sikkim', 27.2341, 88.4975, 350, 'logistics_hub', 1],
    [40, 'Gangtok', 'Sikkim', 27.3389, 88.6065, 1650, 'state_capital', 1],
    [41, 'Mangan', 'Sikkim', 27.5072, 88.5342, 1310, 'district_hq', 1],
    [42, 'Chungthang', 'Sikkim', 27.6041, 88.6472, 1790, 'mountain_pass', 1],
    [43, 'Nathu La Pass', 'Sikkim', 27.3864, 88.8309, 4310, 'border_checkpost', 1],

    // Intermediate strategic nodes (Marked as demo/approximate transit nodes)
    [44, 'Nalbari', 'Assam', 26.4447, 91.4428, 42, 'district_hq', 0],
    [45, 'Goalpara', 'Assam', 26.1772, 90.6272, 35, 'logistics_hub', 0],
    [46, 'Alipurduar', 'West Bengal', 26.4919, 89.5271, 93, 'border_checkpost', 1]
  ];

  for (const loc of locations) {
    insertLocation.run(...loc);
  }

  console.log('Seeding 47 highway road corridors (bidirectional ~75 graph edges)...');
  const insertSegment = db.prepare(`
    INSERT INTO road_segments (origin_location_id, destination_location_id, highway_code, distance_km, base_transit_time_min, terrain_type, road_condition, slope_angle_deg, is_bidirectional)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const segments = [
    // Siliguri corridor to Assam / Sikkim
    [1, 46, 'NH-27', 115, 150, 'plain', 'good', 1.0],
    [46, 44, 'NH-27', 190, 240, 'plain', 'fair', 1.5],
    [44, 2, 'NH-27', 60, 75, 'plain', 'good', 1.0],

    // Siliguri to Sikkim (NH-10)
    [1, 38, 'NH-10', 70, 110, 'hilly', 'fair', 6.0],
    [38, 39, 'NH-10', 12, 20, 'hilly', 'good', 5.0],
    [39, 40, 'NH-10', 28, 55, 'steep_mountain', 'fair', 9.0],
    [40, 41, 'NH-10', 52, 110, 'steep_mountain', 'poor', 12.0],
    [41, 42, 'NH-10', 26, 65, 'high_pass', 'poor', 14.0],
    [40, 43, 'Jawaharlal Nehru Rd', 54, 120, 'high_pass', 'fair', 16.0],

    // Guwahati core connections
    [2, 3, 'GS Road', 10, 20, 'plain', 'good', 0.5],
    [2, 12, 'NH-6', 50, 70, 'hilly', 'good', 4.0],
    [12, 13, 'NH-6', 52, 80, 'hilly', 'good', 7.0],
    [13, 14, 'SH-5', 54, 95, 'steep_mountain', 'fair', 11.0],
    [13, 15, 'NH-6', 64, 100, 'hilly', 'good', 6.0],
    [2, 45, 'NH-17', 130, 180, 'plain', 'good', 2.0],
    [45, 16, 'NH-217', 120, 200, 'hilly', 'fair', 5.0],

    // Assam Eastbound (NH-27 / NH-37)
    [2, 5, 'NH-27', 120, 150, 'plain', 'good', 1.0],
    [5, 4, 'NH-715', 50, 70, 'plain', 'good', 1.5],
    [5, 6, 'NH-27', 180, 230, 'plain', 'good', 1.0],
    [6, 7, 'NH-27', 130, 170, 'plain', 'good', 1.0],
    [7, 8, 'NH-27', 48, 60, 'plain', 'good', 0.5],
    [7, 23, 'NH-515', 150, 240, 'hilly', 'fair', 4.0],

    // Arunachal Pradesh Route (Tezpur -> Tawang via Sela Pass)
    [4, 11, 'NH-13', 60, 90, 'hilly', 'good', 5.0],
    [11, 19, 'NH-13', 95, 180, 'steep_mountain', 'fair', 12.0],
    [19, 20, 'NH-13', 25, 45, 'steep_mountain', 'good', 10.0],
    [20, 21, 'NH-13', 42, 110, 'high_pass', 'poor', 18.0],
    [21, 22, 'NH-13', 78, 140, 'high_pass', 'fair', 15.0],

    // Alternative Arunachal Highway (Tezpur -> Itanagar)
    [4, 18, 'NH-15', 150, 210, 'plain', 'good', 2.0],
    [18, 17, 'NH-415', 15, 30, 'hilly', 'good', 4.0],

    // Dima Hasao / Barak Valley Lifeline (NH-6 / NH-27)
    [5, 10, 'NH-27', 140, 260, 'steep_mountain', 'poor', 14.0],
    [10, 9, 'NH-27', 100, 180, 'steep_mountain', 'poor', 13.0],
    [15, 9, 'NH-6', 140, 220, 'steep_mountain', 'fair', 9.0],

    // Silchar to Tripura Corridor (NH-8)
    [9, 34, 'NH-8', 95, 150, 'hilly', 'fair', 5.0],
    [34, 35, 'NH-8', 12, 20, 'plain', 'good', 2.0],
    [35, 36, 'NH-8', 170, 260, 'hilly', 'good', 4.0],
    [36, 37, 'NH-8', 55, 80, 'plain', 'good', 1.0],

    // Silchar to Manipur / Nagaland / Mizoram
    [9, 30, 'NH-37', 50, 80, 'plain', 'good', 2.0],
    [30, 28, 'NH-37', 170, 330, 'steep_mountain', 'poor', 13.0],
    [9, 31, 'NH-306', 90, 150, 'hilly', 'fair', 7.0],
    [31, 32, 'NH-306', 85, 140, 'steep_mountain', 'fair', 10.0],
    [32, 33, 'NH-54', 165, 270, 'steep_mountain', 'fair', 11.0],

    // Dimapur - Kohima - Imphal Corridor (NH-29 / NH-2)
    [5, 24, 'NH-29', 125, 170, 'plain', 'good', 2.0],
    [24, 25, 'NH-29', 74, 140, 'steep_mountain', 'fair', 10.0],
    [25, 26, 'NH-2', 90, 160, 'hilly', 'fair', 8.0],
    [25, 27, 'NH-2', 80, 150, 'steep_mountain', 'fair', 11.0],
    [27, 28, 'NH-2', 60, 100, 'hilly', 'good', 6.0],
    [28, 29, 'NH-2', 65, 100, 'hilly', 'fair', 5.0]
  ];

  for (const seg of segments) {
    insertSegment.run(...seg);
  }

  console.log('Seeding initial disruptions...');
  const insertDisruption = db.prepare(`
    INSERT INTO disruptions (road_segment_id, disruption_type, severity, description, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const selaSegment = db.prepare(`SELECT id FROM road_segments WHERE origin_location_id = 20 AND destination_location_id = 21`).get();
  if (selaSegment) {
    insertDisruption.run(selaSegment.id, 'landslide', 'critical_blocked', 'Massive mudslide blocking NH-13 at Sela Pass elevation 4,100m. Clearance underway.', 'active');
  }

  const haflongSegment = db.prepare(`SELECT id FROM road_segments WHERE origin_location_id = 5 AND destination_location_id = 10`).get();
  if (haflongSegment) {
    insertDisruption.run(haflongSegment.id, 'flash_flood', 'high', 'Heavy rain causing waterlogging & debris flow on Dima Hasao hill highway.', 'active');
  }

  console.log('Seeding initial weather data...');
  const insertWeather = db.prepare(`
    INSERT INTO weather_data (location_id, rainfall_mm_24h, wind_speed_kmh, fog_visibility_m, landslide_risk_index, flood_warning_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertWeather.run(21, 145.0, 45.0, 500.0, 0.88, 'warning'); // Sela Pass
  insertWeather.run(14, 260.0, 30.0, 1000.0, 0.92, 'severe'); // Cherrapunji
  insertWeather.run(10, 110.0, 20.0, 2000.0, 0.75, 'advisory'); // Haflong
  insertWeather.run(2, 25.0, 12.0, 9000.0, 0.10, 'none');     // Guwahati
  insertWeather.run(40, 65.0, 18.0, 4000.0, 0.45, 'advisory'); // Gangtok

  console.log('Seeding initial demo shipment...');
  const insertShipment = db.prepare(`
    INSERT INTO shipments (tracking_code, origin_location_id, destination_location_id, cargo_type, priority, weight_kg, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertShipment.run('NER-MED-202609-001', 2, 22, 'medicines', 'critical', 450.0, 'pending');
  insertShipment.run('NER-FOOD-202609-002', 1, 40, 'food_supplies', 'urgent', 1200.0, 'pending');

  console.log('Database seeding complete! 46 Locations & ~75 Road Edges inserted successfully.');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
