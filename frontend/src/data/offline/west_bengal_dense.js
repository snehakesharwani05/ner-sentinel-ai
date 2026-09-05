export const WEST_BENGAL_DENSE_GRAPH = {
  "state": "West Bengal",
  "state_key": "west_bengal",
  "node_count": 8,
  "edge_count": 9,
  "nodes": [
    {
      "id": 1,
      "name": "Siliguri",
      "state": "West Bengal",
      "district": "Darjeeling",
      "latitude": 26.7271,
      "longitude": 88.3953,
      "lat": 26.7271,
      "lng": 88.3953,
      "elevation_m": 122,
      "location_type": "logistics_hub",
      "is_urban": 1,
      "risk_score": 0.08
    },
    {
      "id": 46,
      "name": "Alipurduar",
      "state": "West Bengal",
      "district": "Alipurduar",
      "latitude": 26.4919,
      "longitude": 89.5271,
      "lat": 26.4919,
      "lng": 89.5271,
      "elevation_m": 93,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.1
    },
    {
      "id": 85,
      "name": "Jalpaiguri",
      "state": "West Bengal",
      "district": "Jalpaiguri",
      "latitude": 26.54,
      "longitude": 88.73,
      "lat": 26.54,
      "lng": 88.73,
      "elevation_m": 86,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.1
    },
    {
      "id": 86,
      "name": "Cooch Behar",
      "state": "West Bengal",
      "district": "Cooch Behar",
      "latitude": 26.32,
      "longitude": 89.45,
      "lat": 26.32,
      "lng": 89.45,
      "elevation_m": 48,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.1
    },
    {
      "id": 87,
      "name": "Darjeeling",
      "state": "West Bengal",
      "district": "Darjeeling",
      "latitude": 27.041,
      "longitude": 88.2663,
      "lat": 27.041,
      "lng": 88.2663,
      "elevation_m": 2042,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.35
    },
    {
      "id": 88,
      "name": "Kalimpong",
      "state": "West Bengal",
      "district": "Kalimpong",
      "latitude": 27.06,
      "longitude": 88.47,
      "lat": 27.06,
      "lng": 88.47,
      "elevation_m": 1250,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.35
    },
    {
      "id": 181,
      "name": "Mainaguri",
      "state": "West Bengal",
      "district": "Jalpaiguri",
      "latitude": 26.56,
      "longitude": 88.82,
      "lat": 26.56,
      "lng": 88.82,
      "elevation_m": 80,
      "location_type": "subdivision_town",
      "is_urban": 1,
      "risk_score": 0.1
    },
    {
      "id": 182,
      "name": "Hasimara",
      "state": "West Bengal",
      "district": "Alipurduar",
      "latitude": 26.75,
      "longitude": 89.35,
      "lat": 26.75,
      "lng": 89.35,
      "elevation_m": 110,
      "location_type": "highway_junction",
      "is_urban": 1,
      "risk_score": 0.12
    }
  ],
  "edges": [
    {
      "u": "Siliguri",
      "v": "Jalpaiguri",
      "origin": "Siliguri",
      "destination": "Jalpaiguri",
      "distance_km": 45.0,
      "highway": "NH-27",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "fastest_time_min": 45.0,
      "safest_cost": 40.05,
      "is_urban": true,
      "coordinates": [
        [
          26.7271,
          88.3953
        ],
        [
          26.54,
          88.73
        ]
      ]
    },
    {
      "u": "Jalpaiguri",
      "v": "Mainaguri",
      "origin": "Jalpaiguri",
      "destination": "Mainaguri",
      "distance_km": 15.0,
      "highway": "NH-27",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "fastest_time_min": 15.0,
      "safest_cost": 13.35,
      "is_urban": true,
      "coordinates": [
        [
          26.54,
          88.73
        ],
        [
          26.56,
          88.82
        ]
      ]
    },
    {
      "u": "Mainaguri",
      "v": "Alipurduar",
      "origin": "Mainaguri",
      "destination": "Alipurduar",
      "distance_km": 90.0,
      "highway": "NH-27",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "fastest_time_min": 90.0,
      "safest_cost": 80.1,
      "is_urban": true,
      "coordinates": [
        [
          26.56,
          88.82
        ],
        [
          26.4919,
          89.5271
        ]
      ]
    },
    {
      "u": "Alipurduar",
      "v": "Hasimara",
      "origin": "Alipurduar",
      "destination": "Hasimara",
      "distance_km": 30.0,
      "highway": "NH-317",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "fastest_time_min": 30.0,
      "safest_cost": 26.7,
      "is_urban": true,
      "coordinates": [
        [
          26.4919,
          89.5271
        ],
        [
          26.75,
          89.35
        ]
      ]
    },
    {
      "u": "Alipurduar",
      "v": "Cooch Behar",
      "origin": "Alipurduar",
      "destination": "Cooch Behar",
      "distance_km": 25.0,
      "highway": "NH-317",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "fastest_time_min": 25.0,
      "safest_cost": 22.25,
      "is_urban": true,
      "coordinates": [
        [
          26.4919,
          89.5271
        ],
        [
          26.32,
          89.45
        ]
      ]
    },
    {
      "u": "Alipurduar",
      "v": "Kokrajhar",
      "origin": "Alipurduar",
      "destination": "Kokrajhar",
      "distance_km": 70.0,
      "highway": "NH-27",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "fastest_time_min": 70.0,
      "safest_cost": 62.3,
      "is_urban": true,
      "coordinates": [
        [
          26.4919,
          89.5271
        ],
        [
          26.4,
          90.27
        ]
      ]
    },
    {
      "u": "Cooch Behar",
      "v": "Dhubri",
      "origin": "Cooch Behar",
      "destination": "Dhubri",
      "distance_km": 60.0,
      "highway": "NH-17",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "fastest_time_min": 60.0,
      "safest_cost": 53.4,
      "is_urban": true,
      "coordinates": [
        [
          26.32,
          89.45
        ],
        [
          26.02,
          89.98
        ]
      ]
    },
    {
      "u": "Siliguri",
      "v": "Darjeeling",
      "origin": "Siliguri",
      "destination": "Darjeeling",
      "distance_km": 65.0,
      "highway": "NH-110",
      "terrain": "steep_mountain",
      "slope_deg": 9.0,
      "condition": "good",
      "speed_kmh": 42.0,
      "fastest_time_min": 92.9,
      "safest_cost": 140.21,
      "is_urban": true,
      "coordinates": [
        [
          26.7271,
          88.3953
        ],
        [
          27.041,
          88.2663
        ]
      ]
    },
    {
      "u": "Siliguri",
      "v": "Kalimpong",
      "origin": "Siliguri",
      "destination": "Kalimpong",
      "distance_km": 65.0,
      "highway": "NH-10 / NH-717A",
      "terrain": "steep_mountain",
      "slope_deg": 8.0,
      "condition": "fair",
      "speed_kmh": 42.0,
      "fastest_time_min": 92.9,
      "safest_cost": 138.36,
      "is_urban": true,
      "coordinates": [
        [
          26.7271,
          88.3953
        ],
        [
          27.06,
          88.47
        ]
      ]
    }
  ]
};
export default WEST_BENGAL_DENSE_GRAPH;
