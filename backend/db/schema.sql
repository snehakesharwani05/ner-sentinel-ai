-- Database Schema for Intelligent Logistics and Accessibility Platform (NER Sentinel)

-- 1. USERS & ACCESS CONTROL
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'operator', 'disaster_mgmt', 'driver')) NOT NULL DEFAULT 'operator',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. LOCATIONS (Graph Nodes)
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state TEXT NOT NULL CHECK(state IN ('Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim', 'West Bengal')),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    elevation_m INTEGER NOT NULL DEFAULT 100,
    location_type TEXT CHECK(location_type IN ('state_capital', 'logistics_hub', 'district_hq', 'mountain_pass', 'border_checkpost', 'remote_village')) NOT NULL,
    is_verified_seed BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROAD SEGMENTS (Graph Edges)
CREATE TABLE IF NOT EXISTS road_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin_location_id INTEGER NOT NULL,
    destination_location_id INTEGER NOT NULL,
    highway_code TEXT NOT NULL,
    distance_km REAL NOT NULL,
    base_transit_time_min INTEGER NOT NULL,
    terrain_type TEXT CHECK(terrain_type IN ('plain', 'hilly', 'steep_mountain', 'high_pass')) NOT NULL DEFAULT 'plain',
    road_condition TEXT CHECK(road_condition IN ('good', 'fair', 'poor', 'critical')) NOT NULL DEFAULT 'good',
    slope_angle_deg REAL DEFAULT 0.0,
    is_bidirectional BOOLEAN DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY(origin_location_id) REFERENCES locations(id),
    FOREIGN KEY(destination_location_id) REFERENCES locations(id)
);

-- 4. DISRUPTIONS (Dynamic Road Hazards)
CREATE TABLE IF NOT EXISTS disruptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    road_segment_id INTEGER NOT NULL,
    disruption_type TEXT CHECK(disruption_type IN ('landslide', 'flash_flood', 'bridge_damage', 'roadblock', 'severe_weather', 'roadwork')) NOT NULL,
    severity TEXT CHECK(severity IN ('low', 'moderate', 'high', 'critical_blocked')) NOT NULL,
    description TEXT,
    reported_by INTEGER,
    status TEXT CHECK(status IN ('active', 'cleared', 'under_repair')) DEFAULT 'active',
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_clearance DATETIME,
    FOREIGN KEY(road_segment_id) REFERENCES road_segments(id),
    FOREIGN KEY(reported_by) REFERENCES users(id)
);

-- 5. WEATHER DATA (Environmental Indices)
CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL,
    rainfall_mm_24h REAL DEFAULT 0.0,
    wind_speed_kmh REAL DEFAULT 0.0,
    fog_visibility_m REAL DEFAULT 10000.0,
    landslide_risk_index REAL DEFAULT 0.0,
    flood_warning_level TEXT CHECK(flood_warning_level IN ('none', 'advisory', 'warning', 'severe')) DEFAULT 'none',
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(location_id) REFERENCES locations(id)
);

-- 6. SHIPMENTS (Logistics Packages)
CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT UNIQUE NOT NULL,
    origin_location_id INTEGER NOT NULL,
    destination_location_id INTEGER NOT NULL,
    cargo_type TEXT CHECK(cargo_type IN ('medicines', 'food_supplies', 'fuel', 'construction_materials', 'general')) NOT NULL,
    priority TEXT CHECK(priority IN ('critical', 'urgent', 'normal')) DEFAULT 'normal',
    weight_kg REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'dispatched', 'in_transit', 'delivered', 'rerouted')) DEFAULT 'pending',
    assigned_route_json TEXT,
    dispatched_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(origin_location_id) REFERENCES locations(id),
    FOREIGN KEY(destination_location_id) REFERENCES locations(id)
);
