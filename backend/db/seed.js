const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  await db.init();

  console.log('Dropping and recreating database tables...');
  db.exec(`
    DROP TABLE IF EXISTS shipments;
    DROP TABLE IF EXISTS weather_data;
    DROP TABLE IF EXISTS disruptions;
    DROP TABLE IF EXISTS road_segments;
    DROP TABLE IF EXISTS locations;
    DROP TABLE IF EXISTS users;
  `);

  console.log('Initializing database schema...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schemaSql);

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

  console.log('Seeding granular NER locations...');
  const insertLocation = db.prepare(`
    INSERT INTO locations (id, name, district, state, latitude, longitude, elevation_m, location_type, is_urban, risk_score, is_verified_seed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const locations = [
    // West Bengal (Gateway)
    [1, 'Siliguri', 'Darjeeling', 'West Bengal', 26.7271, 88.3953, 122, 'logistics_hub', 1, 0.08, 1],
    [46, 'Alipurduar', 'Alipurduar', 'West Bengal', 26.4919, 89.5271, 93, 'district_hq', 1, 0.10, 1],
    [85, 'Jalpaiguri', 'Jalpaiguri', 'West Bengal', 26.5400, 88.7300, 86, 'district_hq', 1, 0.10, 1],
    [86, 'Cooch Behar', 'Cooch Behar', 'West Bengal', 26.3200, 89.4500, 48, 'district_hq', 1, 0.10, 1],
    [87, 'Darjeeling', 'Darjeeling', 'West Bengal', 27.0410, 88.2663, 2042, 'district_hq', 1, 0.35, 1],
    [88, 'Kalimpong', 'Kalimpong', 'West Bengal', 27.0600, 88.4700, 1250, 'district_hq', 1, 0.35, 1],
    [181, 'Mainaguri', 'Jalpaiguri', 'West Bengal', 26.5600, 88.8200, 80, 'subdivision_town', 1, 0.10, 1],
    [182, 'Hasimara', 'Alipurduar', 'West Bengal', 26.7500, 89.3500, 110, 'highway_junction', 1, 0.12, 1],

    // Assam
    [2, 'Guwahati', 'Kamrup Metropolitan', 'Assam', 26.1445, 91.7362, 55, 'state_capital', 1, 0.08, 1],
    [3, 'Dispur', 'Kamrup Metropolitan', 'Assam', 26.1433, 91.7898, 55, 'state_capital', 1, 0.05, 1],
    [4, 'Tezpur', 'Sonitpur', 'Assam', 26.6528, 92.7926, 48, 'logistics_hub', 1, 0.12, 1],
    [5, 'Nagaon', 'Nagaon', 'Assam', 26.3452, 92.6835, 52, 'district_hq', 1, 0.10, 1],
    [6, 'Jorhat', 'Jorhat', 'Assam', 26.7509, 94.2037, 116, 'logistics_hub', 1, 0.10, 1],
    [7, 'Dibrugarh', 'Dibrugarh', 'Assam', 27.4728, 94.9120, 108, 'logistics_hub', 1, 0.14, 1],
    [8, 'Tinsukia', 'Tinsukia', 'Assam', 27.4922, 95.3558, 116, 'district_hq', 1, 0.10, 1],
    [9, 'Silchar', 'Cachar', 'Assam', 24.8333, 92.7789, 35, 'logistics_hub', 1, 0.22, 1],
    [10, 'Haflong (Jatinga)', 'Dima Hasao', 'Assam', 25.1804, 93.0169, 512, 'mountain_pass', 0, 0.65, 1],
    [11, 'Bhalukpong', 'Sonitpur', 'Assam', 27.0125, 92.6416, 213, 'border_checkpost', 0, 0.30, 1],
    [44, 'Nalbari', 'Nalbari', 'Assam', 26.4447, 91.4428, 42, 'district_hq', 1, 0.12, 1],
    [45, 'Goalpara', 'Goalpara', 'Assam', 26.1772, 90.6272, 35, 'logistics_hub', 1, 0.15, 1],
    [51, 'Bongaigaon', 'Bongaigaon', 'Assam', 26.4800, 90.5600, 54, 'logistics_hub', 1, 0.10, 1],
    [52, 'Dhubri', 'Dhubri', 'Assam', 26.0200, 89.9800, 34, 'river_port', 1, 0.18, 1],
    [53, 'Barpeta', 'Barpeta', 'Assam', 26.3200, 91.0000, 35, 'district_hq', 1, 0.15, 1],
    [54, 'North Lakhimpur', 'Lakhimpur', 'Assam', 27.2300, 94.1000, 101, 'district_hq', 1, 0.16, 1],
    [55, 'Dhemaji', 'Dhemaji', 'Assam', 27.4800, 94.5800, 91, 'district_hq', 1, 0.20, 1],
    [56, 'Golaghat', 'Golaghat', 'Assam', 26.5200, 93.9700, 95, 'district_hq', 1, 0.10, 1],
    [57, 'Sivasagar', 'Sivasagar', 'Assam', 26.9800, 94.6300, 95, 'district_hq', 1, 0.10, 1],
    [58, 'Kokrajhar', 'Kokrajhar', 'Assam', 26.4000, 90.2700, 38, 'district_hq', 1, 0.10, 1],
    [59, 'Karimganj', 'Karimganj', 'Assam', 24.8700, 92.3500, 13, 'border_checkpost', 1, 0.18, 1],
    [60, 'Hailakandi', 'Hailakandi', 'Assam', 24.6800, 92.5600, 21, 'district_hq', 1, 0.16, 1],
    [61, 'Diphu', 'Karbi Anglong', 'Assam', 25.8400, 93.4300, 186, 'district_hq', 1, 0.22, 1],
    [111, 'Jalukbari', 'Kamrup Metropolitan', 'Assam', 26.1500, 91.6600, 52, 'highway_junction', 1, 0.06, 1],
    [112, 'Khanapara', 'Kamrup Metropolitan', 'Assam', 26.1100, 91.8200, 60, 'highway_junction', 1, 0.06, 1],
    [113, 'Jagiroad', 'Morigaon', 'Assam', 26.1200, 92.2100, 50, 'subdivision_town', 1, 0.08, 1],
    [114, 'Raha', 'Nagaon', 'Assam', 26.2300, 92.5200, 52, 'market_center', 1, 0.09, 1],
    [115, 'Numaligarh', 'Golaghat', 'Assam', 26.6300, 93.7500, 85, 'highway_junction', 1, 0.08, 1],
    [116, 'Barpeta Road', 'Barpeta', 'Assam', 26.5000, 90.9700, 48, 'market_center', 1, 0.10, 1],
    [117, 'Digboi', 'Tinsukia', 'Assam', 27.3800, 95.6200, 150, 'subdivision_town', 1, 0.12, 1],
    [118, 'Badarpur', 'Karimganj', 'Assam', 24.9000, 92.6000, 25, 'highway_junction', 1, 0.15, 1],

    // Meghalaya
    [12, 'Shillong', 'East Khasi Hills', 'Meghalaya', 25.5788, 91.8933, 1525, 'state_capital', 1, 0.12, 1],
    [13, 'Cherrapunji (Sohra)', 'East Khasi Hills', 'Meghalaya', 25.2702, 91.7323, 1484, 'district_hq', 1, 0.48, 1],
    [14, 'Jowai', 'West Jaintia Hills', 'Meghalaya', 25.4500, 92.2000, 1380, 'district_hq', 1, 0.20, 1],
    [15, 'Nongpoh', 'Ri Bhoi', 'Meghalaya', 25.9036, 91.8800, 485, 'district_hq', 1, 0.15, 1],
    [16, 'Tura', 'West Garo Hills', 'Meghalaya', 25.5138, 90.2202, 349, 'logistics_hub', 1, 0.18, 1],
    [67, 'Mawsynram', 'East Khasi Hills', 'Meghalaya', 25.3000, 91.5800, 1400, 'subdivision_town', 0, 0.55, 1],
    [68, 'Dawki', 'West Jaintia Hills', 'Meghalaya', 25.1800, 92.0200, 105, 'border_checkpost', 0, 0.28, 1],
    [69, 'Williamnagar', 'East Garo Hills', 'Meghalaya', 25.6000, 90.6200, 290, 'district_hq', 1, 0.22, 1],
    [70, 'Nongstoin', 'West Khasi Hills', 'Meghalaya', 25.5200, 91.2700, 1409, 'district_hq', 1, 0.24, 1],
    [131, 'Byrnihat', 'Ri Bhoi', 'Meghalaya', 26.0500, 91.8500, 150, 'logistics_hub', 1, 0.10, 1],
    [132, 'Khliehriat', 'East Jaintia Hills', 'Meghalaya', 25.3500, 92.3700, 1200, 'district_hq', 1, 0.35, 1],
    [133, 'Mairang', 'Eastern West Khasi Hills', 'Meghalaya', 25.5600, 91.6400, 1550, 'district_hq', 1, 0.20, 1],

    // Arunachal Pradesh
    [17, 'Itanagar', 'Papum Pare', 'Arunachal Pradesh', 27.0844, 93.6053, 320, 'state_capital', 1, 0.15, 1],
    [18, 'Naharlagun', 'Papum Pare', 'Arunachal Pradesh', 27.1064, 93.6931, 200, 'logistics_hub', 1, 0.12, 1],
    [19, 'Bomdila', 'West Kameng', 'Arunachal Pradesh', 27.2646, 92.4159, 2415, 'district_hq', 1, 0.35, 1],
    [20, 'Dirang', 'West Kameng', 'Arunachal Pradesh', 27.3592, 92.2392, 1560, 'subdivision_town', 0, 0.40, 1],
    [21, 'Sela Pass', 'Tawang', 'Arunachal Pradesh', 27.5050, 92.1058, 4170, 'mountain_pass', 0, 0.85, 1],
    [22, 'Tawang', 'Tawang', 'Arunachal Pradesh', 27.5861, 91.8594, 3048, 'border_checkpost', 1, 0.45, 1],
    [23, 'Pasighat', 'East Siang', 'Arunachal Pradesh', 28.0661, 95.3262, 155, 'logistics_hub', 1, 0.20, 1],
    [105, 'Ziro', 'Lower Subansiri', 'Arunachal Pradesh', 27.5949, 93.8385, 1572, 'district_hq', 1, 0.28, 1],
    [106, 'Along (Aalo)', 'West Siang', 'Arunachal Pradesh', 28.1691, 94.7972, 619, 'district_hq', 1, 0.38, 1],
    [107, 'Roing', 'Lower Dibang Valley', 'Arunachal Pradesh', 28.1408, 95.8354, 390, 'district_hq', 1, 0.25, 1],
    [47, 'Tezu', 'Lohit', 'Arunachal Pradesh', 27.9144, 96.1669, 185, 'district_hq', 1, 0.22, 1],
    [48, 'Namsai', 'Namsai', 'Arunachal Pradesh', 27.6698, 95.8711, 156, 'district_hq', 1, 0.18, 1],
    [49, 'Changlang', 'Changlang', 'Arunachal Pradesh', 27.1278, 95.7389, 580, 'district_hq', 0, 0.32, 1],
    [50, 'Khonsa', 'Tirap', 'Arunachal Pradesh', 27.0203, 95.5683, 1215, 'district_hq', 0, 0.35, 1],
    [101, 'Banderdewa', 'Papum Pare', 'Arunachal Pradesh', 27.1100, 93.8200, 120, 'border_checkpost', 1, 0.15, 1],
    [102, 'Rupa', 'West Kameng', 'Arunachal Pradesh', 27.2000, 92.4000, 1400, 'highway_junction', 0, 0.30, 1],
    [103, 'Jang', 'Tawang', 'Arunachal Pradesh', 27.5700, 91.9800, 2100, 'subdivision_town', 0, 0.50, 1],
    [104, 'Miao', 'Changlang', 'Arunachal Pradesh', 27.4900, 96.2000, 240, 'market_center', 0, 0.25, 1],

    // Nagaland
    [24, 'Dimapur', 'Dimapur', 'Nagaland', 25.9068, 93.7271, 145, 'logistics_hub', 1, 0.10, 1],
    [25, 'Kohima', 'Kohima', 'Nagaland', 25.6701, 94.1077, 1444, 'state_capital', 1, 0.25, 1],
    [26, 'Mokokchung', 'Mokokchung', 'Nagaland', 26.3256, 94.5215, 1325, 'district_hq', 1, 0.28, 1],
    [38, 'Wokha', 'Wokha', 'Nagaland', 26.1000, 94.2600, 1313, 'district_hq', 1, 0.30, 1],
    [75, 'Tuensang', 'Tuensang', 'Nagaland', 26.2800, 94.8300, 1371, 'district_hq', 1, 0.35, 1],
    [76, 'Zunheboto', 'Zunheboto', 'Nagaland', 25.9700, 94.5200, 1874, 'district_hq', 1, 0.35, 1],
    [77, 'Mon', 'Mon', 'Nagaland', 26.7500, 95.0600, 897, 'district_hq', 1, 0.32, 1],
    [78, 'Phek', 'Phek', 'Nagaland', 25.6600, 94.4600, 1024, 'district_hq', 1, 0.35, 1],
    [151, 'Chumoukedima', 'Chumoukedima', 'Nagaland', 25.7900, 93.7700, 180, 'subdivision_town', 1, 0.12, 1],
    [152, 'Medziphema', 'Chumoukedima', 'Nagaland', 25.7500, 93.8500, 310, 'highway_junction', 1, 0.15, 1],
    [153, 'Tseminyu', 'Tseminyu', 'Nagaland', 25.9000, 94.2100, 1260, 'subdivision_town', 0, 0.28, 1],

    // Manipur
    [27, 'Senapati', 'Senapati', 'Manipur', 25.2683, 94.0186, 1100, 'district_hq', 1, 0.35, 1],
    [28, 'Imphal', 'Imphal West', 'Manipur', 24.8170, 93.9368, 786, 'state_capital', 1, 0.12, 1],
    [29, 'Churachandpur', 'Churachandpur', 'Manipur', 24.3333, 93.6833, 914, 'district_hq', 1, 0.25, 1],
    [30, 'Jiribam', 'Jiribam', 'Manipur', 24.8014, 93.1186, 42, 'border_checkpost', 1, 0.20, 1],
    [62, 'Ukhrul', 'Ukhrul', 'Manipur', 25.1167, 94.3667, 1662, 'district_hq', 1, 0.40, 1],
    [63, 'Thoubal', 'Thoubal', 'Manipur', 24.6333, 93.9833, 775, 'district_hq', 1, 0.10, 1],
    [64, 'Bishnupur', 'Bishnupur', 'Manipur', 24.6300, 93.7600, 790, 'district_hq', 1, 0.10, 1],
    [65, 'Kakching', 'Kakching', 'Manipur', 24.4800, 93.9800, 776, 'district_hq', 1, 0.10, 1],
    [66, 'Moreh', 'Tengnoupal', 'Manipur', 24.2500, 94.3000, 220, 'border_checkpost', 1, 0.35, 1],
    [121, 'Kangpokpi', 'Kangpokpi', 'Manipur', 25.1500, 93.9700, 1050, 'subdivision_town', 0, 0.30, 1],
    [122, 'Moirang', 'Bishnupur', 'Manipur', 24.5000, 93.7700, 770, 'market_center', 1, 0.10, 1],
    [123, 'Noney', 'Noney', 'Manipur', 24.8300, 93.6000, 450, 'highway_junction', 0, 0.55, 1],

    // Mizoram
    [31, 'Kolasib', 'Kolasib', 'Mizoram', 24.2247, 92.6781, 612, 'district_hq', 1, 0.25, 1],
    [32, 'Aizawl', 'Aizawl', 'Mizoram', 23.7271, 92.7176, 1132, 'state_capital', 1, 0.20, 1],
    [33, 'Lunglei', 'Lunglei', 'Mizoram', 22.8833, 92.7333, 722, 'logistics_hub', 1, 0.25, 1],
    [34, 'Champhai', 'Champhai', 'Mizoram', 23.4560, 93.3282, 1678, 'border_checkpost', 1, 0.35, 1],
    [71, 'Vairengte', 'Kolasib', 'Mizoram', 24.5000, 92.7600, 220, 'border_checkpost', 0, 0.20, 1],
    [72, 'Serchhip', 'Serchhip', 'Mizoram', 23.3400, 92.8500, 880, 'district_hq', 1, 0.22, 1],
    [73, 'Lawngtlai', 'Lawngtlai', 'Mizoram', 22.5300, 92.8900, 780, 'district_hq', 1, 0.28, 1],
    [74, 'Saiha', 'Siaha', 'Mizoram', 22.4800, 92.9700, 729, 'district_hq', 1, 0.30, 1],
    [141, 'Lengpui', 'Mamit', 'Mizoram', 23.8400, 92.6200, 420, 'highway_junction', 1, 0.15, 1],
    [142, 'Thenzawl', 'Serchhip', 'Mizoram', 23.3100, 92.7500, 780, 'market_center', 0, 0.22, 1],
    [143, 'Mamit', 'Mamit', 'Mizoram', 23.9300, 92.4900, 718, 'district_hq', 1, 0.25, 1],

    // Tripura
    [201, 'Agartala', 'West Tripura', 'Tripura', 23.8315, 91.2868, 12, 'state_capital', 1, 0.08, 1],
    [202, 'Udaipur', 'Gomati', 'Tripura', 23.5333, 91.4833, 25, 'district_hq', 1, 0.10, 1],
    [203, 'Dharmanagar', 'North Tripura', 'Tripura', 24.3833, 92.1667, 21, 'logistics_hub', 1, 0.12, 1],
    [204, 'Kailashahar', 'Unakoti', 'Tripura', 24.3333, 92.0000, 23, 'district_hq', 1, 0.12, 1],
    [205, 'Ambassa', 'Dhalai', 'Tripura', 23.9167, 91.8500, 60, 'district_hq', 1, 0.18, 1],
    [206, 'Belonia', 'South Tripura', 'Tripura', 23.2500, 91.4500, 23, 'border_checkpost', 1, 0.12, 1],
    [207, 'Sabroom', 'South Tripura', 'Tripura', 23.0000, 91.7000, 25, 'border_checkpost', 1, 0.14, 1],
    [209, 'Kanchanpur', 'North Tripura', 'Tripura', 23.9800, 92.2200, 75, 'subdivision_town', 0, 0.20, 1],
    [210, 'Teliamura', 'Khowai', 'Tripura', 23.8300, 91.6000, 35, 'subdivision_town', 1, 0.15, 1],
    [171, 'Kumarghat', 'Unakoti', 'Tripura', 24.1600, 92.0200, 28, 'highway_junction', 1, 0.12, 1],
    [172, 'Bishalgarh', 'Sipahijala', 'Tripura', 23.6800, 91.3000, 20, 'subdivision_town', 1, 0.10, 1],

    // Sikkim
    [39, 'Gangtok', 'East Sikkim', 'Sikkim', 27.3389, 88.6065, 1650, 'state_capital', 1, 0.20, 1],
    [40, 'Namchi', 'South Sikkim', 'Sikkim', 27.1667, 88.3500, 1315, 'district_hq', 1, 0.25, 1],
    [41, 'Geyzing', 'West Sikkim', 'Sikkim', 27.2833, 88.2500, 1900, 'district_hq', 1, 0.30, 1],
    [42, 'Mangan', 'North Sikkim', 'Sikkim', 27.5000, 88.5333, 1790, 'district_hq', 1, 0.55, 1],
    [43, 'Rangpo', 'Pakyong', 'Sikkim', 27.1764, 88.5283, 330, 'border_checkpost', 1, 0.35, 1],
    [79, 'Singtam', 'Gangtok', 'Sikkim', 27.2300, 88.5000, 410, 'logistics_hub', 1, 0.25, 1],
    [80, 'Chungthang', 'North Sikkim', 'Sikkim', 27.6000, 88.6500, 1790, 'mountain_pass', 0, 0.70, 1],
    [81, 'Lachung', 'North Sikkim', 'Sikkim', 27.6900, 88.7400, 2700, 'mountain_pass', 0, 0.65, 1],
    [82, 'Lachen', 'North Sikkim', 'Sikkim', 27.7200, 88.5500, 2750, 'mountain_pass', 0, 0.68, 1],
    [83, 'Nathu La Pass', 'East Sikkim', 'Sikkim', 27.3865, 88.8310, 4310, 'border_checkpost', 0, 0.75, 1],
    [84, 'Ravangla', 'South Sikkim', 'Sikkim', 27.3000, 88.3600, 2100, 'subdivision_town', 1, 0.28, 1],
    [161, 'Jorethang', 'South Sikkim', 'Sikkim', 27.1200, 88.3000, 300, 'logistics_hub', 1, 0.18, 1],
    [162, 'Pelling', 'West Sikkim', 'Sikkim', 27.3000, 88.2300, 2150, 'market_center', 1, 0.32, 1]
  ];

  for (const loc of locations) {
    insertLocation.run(...loc);
  }

  console.log(`Seeded ${locations.length} unique granular NER locations successfully.`);

  console.log('Seeding highway road network and municipal bypass segments...');
  const insertSegment = db.prepare(`
    INSERT INTO road_segments (origin_location_id, destination_location_id, highway_code, distance_km, base_transit_time_min, terrain_type, road_condition, slope_angle_deg, is_bidirectional)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const segments = [
    // Siliguri corridor to Assam / Sikkim
    [1, 85, 'NH-27', 45, 60, 'plain', 'good', 0.5],
    [85, 181, 'NH-27', 15, 20, 'plain', 'good', 0.5],
    [181, 46, 'NH-27', 90, 120, 'plain', 'good', 0.5],
    [46, 182, 'NH-317', 30, 40, 'plain', 'good', 0.5],
    [46, 86, 'NH-317', 25, 35, 'plain', 'good', 0.5],
    [46, 58, 'NH-27', 70, 90, 'plain', 'good', 0.5],
    [86, 52, 'NH-17', 60, 85, 'plain', 'good', 0.5],
    [1, 87, 'NH-110', 65, 135, 'steep_mountain', 'good', 9.0],
    [1, 88, 'NH-10 / NH-717A', 65, 125, 'steep_mountain', 'fair', 8.0],

    // Siliguri to Sikkim (NH-10)
    [1, 43, 'NH-10', 70, 120, 'steep_mountain', 'poor', 11.0],
    [43, 79, 'NH-10', 15, 25, 'hilly', 'good', 4.0],
    [79, 39, 'NH-10', 25, 40, 'steep_mountain', 'good', 7.0],
    [79, 42, 'NH-10', 40, 85, 'steep_mountain', 'poor', 13.0],
    [42, 80, 'NH-10', 30, 75, 'high_pass', 'poor', 15.0],
    [80, 81, 'NH-10', 24, 60, 'high_pass', 'fair', 12.0],
    [80, 82, 'NH-10', 28, 70, 'high_pass', 'fair', 14.0],
    [39, 83, 'Jawaharlal Nehru Rd', 54, 130, 'high_pass', 'fair', 16.0],
    [79, 40, 'NH-710', 30, 60, 'steep_mountain', 'good', 8.0],
    [40, 161, 'SH-Sikkim', 20, 35, 'hilly', 'good', 6.0],
    [40, 84, 'SH-12', 25, 50, 'steep_mountain', 'good', 7.0],
    [84, 41, 'NH-510', 40, 80, 'steep_mountain', 'fair', 8.0],
    [41, 162, 'SH-Sikkim', 10, 20, 'steep_mountain', 'good', 7.0],

    // Guwahati Core Urban Corridors & Bypasses
    [2, 3, 'GS Road (Capital Arterial)', 10, 15, 'plain', 'good', 0.5],
    [2, 111, 'NH-27 Western Bypass', 12, 15, 'plain', 'good', 0.5],
    [3, 112, 'GS Road', 6, 10, 'plain', 'good', 0.5],
    [112, 113, 'NH-27 (4-Lane Expressway)', 50, 45, 'plain', 'good', 0.5],
    [113, 114, 'NH-27 (4-Lane Expressway)', 40, 35, 'plain', 'good', 0.5],
    [114, 5, 'NH-27', 20, 20, 'plain', 'good', 0.5],
    [2, 5, 'NH-27 Direct Main Corridor', 120, 110, 'plain', 'good', 1.0],

    // Guwahati to Meghalaya
    [2, 131, 'NH-6 (4-Lane)', 20, 20, 'plain', 'good', 1.5],
    [131, 15, 'NH-6 (4-Lane)', 30, 30, 'hilly', 'good', 3.0],
    [15, 12, 'NH-6 (4-Lane Bypass)', 50, 55, 'hilly', 'good', 5.0],
    [2, 15, 'NH-6 Old Highway', 50, 60, 'hilly', 'good', 3.5],
    [12, 13, 'SH-5 (Sohra Highway)', 54, 75, 'steep_mountain', 'good', 8.0],
    [12, 67, 'SH-5', 60, 90, 'steep_mountain', 'fair', 9.0],
    [12, 14, 'NH-6', 65, 85, 'hilly', 'good', 4.0],
    [14, 132, 'NH-6', 35, 45, 'hilly', 'good', 5.0],
    [132, 9, 'NH-6 (Sonapur Tunnel Corridor)', 105, 165, 'steep_mountain', 'poor', 12.0],
    [12, 68, 'NH-206', 80, 115, 'steep_mountain', 'fair', 9.0],
    [68, 14, 'NH-206', 55, 85, 'hilly', 'good', 4.0],
    [12, 133, 'NH-217', 40, 50, 'hilly', 'good', 4.0],
    [133, 70, 'NH-217', 50, 65, 'hilly', 'good', 5.0],
    [70, 69, 'NH-217', 120, 180, 'hilly', 'fair', 6.0],
    [69, 16, 'NH-217', 75, 95, 'hilly', 'good', 4.0],
    [45, 16, 'NH-217', 110, 140, 'hilly', 'good', 4.0],

    // Assam Eastbound Corridor
    [5, 4, 'NH-715 (Kalia Bhomora Bridge)', 50, 55, 'plain', 'good', 1.5],
    [4, 11, 'NH-13', 60, 75, 'hilly', 'good', 5.0],
    [5, 115, 'NH-27', 115, 120, 'plain', 'good', 1.0],
    [115, 56, 'NH-129', 25, 30, 'plain', 'good', 0.5],
    [56, 6, 'SH-Assam Bypass', 45, 50, 'plain', 'good', 0.5],
    [115, 6, 'NH-27 Main Highway', 65, 70, 'plain', 'good', 0.5],
    [6, 57, 'NH-27', 55, 60, 'plain', 'good', 0.5],
    [57, 7, 'NH-27', 75, 85, 'plain', 'good', 0.5],
    [7, 8, 'NH-27', 48, 50, 'plain', 'good', 0.5],
    [8, 117, 'NH-38', 35, 40, 'plain', 'good', 0.5],

    // Dima Hasao & Barak Valley Lifelines
    [5, 10, 'NH-27 (Dima Hasao Hill Highway)', 140, 220, 'steep_mountain', 'poor', 14.0],
    [10, 9, 'NH-27', 100, 160, 'steep_mountain', 'poor', 13.0],
    [14, 9, 'NH-6 (Jaintia Lifeline)', 140, 210, 'steep_mountain', 'poor', 12.0],
    [9, 118, 'NH-37', 28, 35, 'plain', 'good', 0.5],
    [118, 59, 'NH-37', 25, 30, 'plain', 'good', 0.5],
    [118, 60, 'SH-38', 25, 30, 'plain', 'good', 0.5],
    [9, 60, 'SH-38', 35, 40, 'plain', 'good', 0.5],

    // Lower Assam
    [111, 45, 'NH-17', 120, 140, 'plain', 'good', 1.5],
    [111, 44, 'NH-27', 60, 60, 'plain', 'good', 0.5],
    [44, 116, 'NH-27', 45, 45, 'plain', 'good', 0.5],
    [116, 53, 'SH-Barpeta', 18, 25, 'plain', 'good', 0.5],
    [116, 51, 'NH-27', 45, 45, 'plain', 'good', 0.5],
    [51, 58, 'NH-27', 50, 50, 'plain', 'good', 0.5],
    [45, 52, 'NH-17', 80, 100, 'plain', 'good', 1.0],

    // Upper North Bank (Assam -> Arunachal)
    [4, 54, 'NH-15', 170, 200, 'plain', 'good', 1.0],
    [54, 55, 'NH-15', 70, 80, 'plain', 'good', 1.0],
    [55, 7, 'Bogibeel Bridge / NH-15', 60, 65, 'plain', 'good', 0.5],
    [5, 61, 'NH-329', 115, 140, 'hilly', 'fair', 5.0],

    // Arunachal Pradesh
    [11, 102, 'NH-13', 75, 140, 'steep_mountain', 'good', 10.0],
    [102, 19, 'NH-13', 20, 40, 'steep_mountain', 'good', 11.0],
    [19, 20, 'NH-13', 25, 45, 'steep_mountain', 'good', 10.0],
    [20, 21, 'NH-13', 42, 110, 'high_pass', 'poor', 18.0],
    [21, 103, 'NH-13', 45, 85, 'high_pass', 'fair', 15.0],
    [103, 22, 'NH-13', 33, 55, 'steep_mountain', 'good', 12.0],
    [18, 17, 'NH-415', 15, 25, 'hilly', 'good', 4.0],
    [101, 18, 'NH-415', 20, 30, 'plain', 'good', 1.5],
    [4, 101, 'NH-15', 130, 180, 'plain', 'good', 1.5],
    [17, 105, 'NH-13', 110, 220, 'steep_mountain', 'fair', 11.0],
    [54, 105, 'NH-13', 80, 160, 'steep_mountain', 'fair', 12.0],
    [7, 23, 'NH-515', 150, 240, 'hilly', 'fair', 4.0],
    [23, 106, 'NH-13', 105, 200, 'steep_mountain', 'poor', 13.0],
    [23, 107, 'NH-13', 95, 150, 'plain', 'good', 2.0],
    [107, 47, 'NH-13', 65, 100, 'plain', 'good', 1.5],
    [8, 48, 'NH-15', 80, 110, 'plain', 'good', 1.0],
    [48, 47, 'NH-115', 40, 55, 'plain', 'good', 1.0],
    [48, 104, 'NH-215', 50, 75, 'plain', 'good', 1.0],
    [104, 49, 'SH-Arunachal', 45, 85, 'hilly', 'fair', 5.0],
    [8, 49, 'NH-215', 95, 160, 'hilly', 'fair', 6.0],
    [7, 50, 'NH-315A', 110, 190, 'steep_mountain', 'fair', 9.0],

    // Nagaland Corridor
    [5, 24, 'NH-29 (4-Lane Expressway)', 160, 175, 'plain', 'good', 1.5],
    [24, 151, 'NH-29 (4-Lane)', 14, 18, 'plain', 'good', 1.0],
    [151, 152, 'NH-29', 18, 25, 'hilly', 'good', 4.0],
    [152, 25, 'NH-29 (Asian Highway AH-1)', 42, 70, 'steep_mountain', 'fair', 12.0],
    [24, 25, 'NH-29 Main Corridor', 74, 115, 'steep_mountain', 'fair', 12.0],
    [25, 153, 'NH-2', 40, 60, 'steep_mountain', 'good', 8.0],
    [153, 38, 'NH-2', 35, 55, 'steep_mountain', 'fair', 9.0],
    [38, 26, 'NH-2', 80, 130, 'steep_mountain', 'fair', 9.0],
    [26, 75, 'NH-702', 115, 190, 'steep_mountain', 'poor', 12.0],
    [26, 76, 'NH-702D', 60, 100, 'steep_mountain', 'fair', 10.0],
    [25, 78, 'NH-29', 120, 190, 'steep_mountain', 'poor', 11.0],
    [6, 26, 'NH-702', 85, 125, 'hilly', 'good', 6.0],

    // Manipur Corridor
    [9, 30, 'NH-37', 50, 65, 'plain', 'good', 2.0],
    [30, 123, 'NH-37', 110, 190, 'steep_mountain', 'poor', 13.0],
    [123, 28, 'NH-37', 60, 90, 'steep_mountain', 'fair', 10.0],
    [25, 27, 'NH-2', 80, 120, 'steep_mountain', 'fair', 11.0],
    [27, 121, 'NH-2', 25, 35, 'hilly', 'good', 6.0],
    [121, 28, 'NH-2', 35, 45, 'plain', 'good', 2.0],
    [28, 64, 'Tiddim Rd / NH-2', 30, 35, 'plain', 'good', 0.5],
    [64, 122, 'NH-2', 15, 20, 'plain', 'good', 0.5],
    [122, 29, 'NH-2', 20, 25, 'plain', 'good', 1.0],
    [28, 62, 'NH-150', 85, 135, 'steep_mountain', 'fair', 10.0],
    [28, 63, 'NH-102 (Asian Highway AH-1)', 25, 30, 'plain', 'good', 0.5],
    [63, 65, 'NH-102', 20, 25, 'plain', 'good', 0.5],
    [65, 66, 'NH-102', 65, 95, 'hilly', 'fair', 7.0],

    // Mizoram Corridor
    [9, 71, 'NH-306', 45, 70, 'hilly', 'good', 4.0],
    [71, 31, 'NH-306', 40, 65, 'hilly', 'good', 5.0],
    [31, 141, 'NH-306 Bypass', 50, 85, 'hilly', 'good', 6.0],
    [141, 32, 'NH-306', 35, 55, 'steep_mountain', 'good', 8.0],
    [31, 32, 'NH-306 Main', 85, 170, 'steep_mountain', 'fair', 9.0],
    [32, 143, 'NH-108B', 85, 140, 'hilly', 'good', 6.0],
    [143, 209, 'Jampui Hills Road', 60, 100, 'hilly', 'fair', 7.0],
    [32, 142, 'SH-Mizoram Bypass', 85, 145, 'hilly', 'good', 7.0],
    [142, 33, 'SH-Mizoram', 85, 145, 'steep_mountain', 'good', 8.0],
    [32, 72, 'NH-54', 90, 160, 'steep_mountain', 'fair', 8.0],
    [72, 33, 'NH-54', 80, 140, 'steep_mountain', 'fair', 8.0],
    [32, 34, 'NH-102B', 190, 340, 'steep_mountain', 'poor', 13.0],
    [33, 73, 'NH-502A', 90, 160, 'steep_mountain', 'fair', 8.0],
    [73, 74, 'NH-54', 40, 75, 'hilly', 'fair', 6.0],

    // Tripura Corridor
    [59, 203, 'NH-8', 55, 75, 'plain', 'good', 1.5],
    [59, 204, 'NH-208', 55, 75, 'plain', 'good', 1.5],
    [203, 171, 'NH-8', 30, 40, 'plain', 'good', 1.0],
    [204, 171, 'SH-Tripura', 22, 30, 'plain', 'good', 1.0],
    [171, 205, 'NH-8', 50, 75, 'hilly', 'good', 3.0],
    [209, 205, 'Tripura SH', 55, 80, 'hilly', 'good', 3.5],
    [209, 203, 'Tripura SH', 45, 70, 'hilly', 'good', 3.0],
    [205, 210, 'NH-8', 40, 55, 'hilly', 'good', 3.0],
    [210, 201, 'NH-8', 45, 60, 'plain', 'good', 1.0],
    [201, 172, 'NH-8', 20, 25, 'plain', 'good', 0.5],
    [172, 202, 'NH-8', 30, 40, 'plain', 'good', 1.0],
    [202, 206, 'NH-8', 45, 60, 'plain', 'good', 1.0],
    [206, 207, 'NH-8', 40, 55, 'plain', 'good', 1.0]
  ];

  for (const seg of segments) {
    insertSegment.run(...seg);
  }

  console.log(`Seeded ${segments.length} highway & municipal bypass corridors (~${segments.length * 2} bidirectional edges).`);

  console.log('Seeding initial weather data...');
  const insertWeather = db.prepare(`
    INSERT INTO weather_data (location_id, rainfall_mm_24h, wind_speed_kmh, fog_visibility_m, landslide_risk_index, flood_warning_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertWeather.run(21, 145.0, 45.0, 500.0, 0.88, 'warning'); // Sela Pass
  insertWeather.run(13, 260.0, 30.0, 1000.0, 0.92, 'severe'); // Cherrapunji
  insertWeather.run(10, 110.0, 20.0, 2000.0, 0.75, 'advisory'); // Haflong
  insertWeather.run(2, 25.0, 12.0, 9000.0, 0.10, 'none');     // Guwahati
  insertWeather.run(39, 65.0, 18.0, 4000.0, 0.45, 'advisory'); // Gangtok

  console.log('Seeding initial demo shipment...');
  const insertShipment = db.prepare(`
    INSERT INTO shipments (tracking_code, origin_location_id, destination_location_id, cargo_type, priority, weight_kg, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertShipment.run('NER-MED-202609-001', 2, 22, 'medicines', 'critical', 450.0, 'pending');
  insertShipment.run('NER-FOOD-202609-002', 1, 39, 'food_supplies', 'urgent', 1200.0, 'pending');

  console.log('Database seeding complete! High-density NER node & corridor graph initialized.');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
