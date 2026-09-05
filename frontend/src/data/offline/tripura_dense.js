export const TRIPURA_DENSE_GRAPH = {
  "state": "Tripura",
  "state_key": "tripura",
  "node_count": 11,
  "edge_count": 13,
  "nodes": [
    {
      "id": 201,
      "name": "Agartala",
      "state": "Tripura",
      "district": "West Tripura",
      "latitude": 23.8315,
      "longitude": 91.2868,
      "lat": 23.8315,
      "lng": 91.2868,
      "elevation_m": 12,
      "location_type": "state_capital",
      "is_urban": 1,
      "risk_score": 0.08
    },
    {
      "id": 202,
      "name": "Udaipur",
      "state": "Tripura",
      "district": "Gomati",
      "latitude": 23.5333,
      "longitude": 91.4833,
      "lat": 23.5333,
      "lng": 91.4833,
      "elevation_m": 25,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.1
    },
    {
      "id": 203,
      "name": "Dharmanagar",
      "state": "Tripura",
      "district": "North Tripura",
      "latitude": 24.3833,
      "longitude": 92.1667,
      "lat": 24.3833,
      "lng": 92.1667,
      "elevation_m": 21,
      "location_type": "logistics_hub",
      "is_urban": 1,
      "risk_score": 0.12
    },
    {
      "id": 204,
      "name": "Kailashahar",
      "state": "Tripura",
      "district": "Unakoti",
      "latitude": 24.3333,
      "longitude": 92.0,
      "lat": 24.3333,
      "lng": 92.0,
      "elevation_m": 23,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.12
    },
    {
      "id": 205,
      "name": "Ambassa",
      "state": "Tripura",
      "district": "Dhalai",
      "latitude": 23.9167,
      "longitude": 91.85,
      "lat": 23.9167,
      "lng": 91.85,
      "elevation_m": 60,
      "location_type": "district_hq",
      "is_urban": 1,
      "risk_score": 0.18
    },
    {
      "id": 206,
      "name": "Belonia",
      "state": "Tripura",
      "district": "South Tripura",
      "latitude": 23.25,
      "longitude": 91.45,
      "lat": 23.25,
      "lng": 91.45,
      "elevation_m": 23,
      "location_type": "border_checkpost",
      "is_urban": 1,
      "risk_score": 0.12
    },
    {
      "id": 207,
      "name": "Sabroom",
      "state": "Tripura",
      "district": "South Tripura",
      "latitude": 23.0,
      "longitude": 91.7,
      "lat": 23.0,
      "lng": 91.7,
      "elevation_m": 25,
      "location_type": "border_checkpost",
      "is_urban": 1,
      "risk_score": 0.14
    },
    {
      "id": 209,
      "name": "Kanchanpur",
      "state": "Tripura",
      "district": "North Tripura",
      "latitude": 23.98,
      "longitude": 92.22,
      "lat": 23.98,
      "lng": 92.22,
      "elevation_m": 75,
      "location_type": "subdivision_town",
      "is_urban": 0,
      "risk_score": 0.2
    },
    {
      "id": 210,
      "name": "Teliamura",
      "state": "Tripura",
      "district": "Khowai",
      "latitude": 23.83,
      "longitude": 91.6,
      "lat": 23.83,
      "lng": 91.6,
      "elevation_m": 35,
      "location_type": "subdivision_town",
      "is_urban": 1,
      "risk_score": 0.15
    },
    {
      "id": 171,
      "name": "Kumarghat",
      "state": "Tripura",
      "district": "Unakoti",
      "latitude": 24.16,
      "longitude": 92.02,
      "lat": 24.16,
      "lng": 92.02,
      "elevation_m": 28,
      "location_type": "highway_junction",
      "is_urban": 1,
      "risk_score": 0.12
    },
    {
      "id": 172,
      "name": "Bishalgarh",
      "state": "Tripura",
      "district": "Sipahijala",
      "latitude": 23.68,
      "longitude": 91.3,
      "lat": 23.68,
      "lng": 91.3,
      "elevation_m": 20,
      "location_type": "subdivision_town",
      "is_urban": 1,
      "risk_score": 0.1
    }
  ],
  "edges": [
    {
      "u": "Karimganj",
      "v": "Dharmanagar",
      "origin": "Karimganj",
      "destination": "Dharmanagar",
      "distance_km": 55.0,
      "highway": "NH-8",
      "terrain": "plain",
      "slope_deg": 1.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "delta_h": 8.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.0,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 46.8,
      "safest_cost": 50.1,
      "is_urban": true,
      "coordinates": [
        [
          24.87,
          92.35
        ],
        [
          24.3833,
          92.1667
        ]
      ]
    },
    {
      "u": "Karimganj",
      "v": "Kailashahar",
      "origin": "Karimganj",
      "destination": "Kailashahar",
      "distance_km": 55.0,
      "highway": "NH-208",
      "terrain": "plain",
      "slope_deg": 1.5,
      "condition": "good",
      "speed_kmh": 60.0,
      "delta_h": 10.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.0,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 46.8,
      "safest_cost": 50.1,
      "is_urban": true,
      "coordinates": [
        [
          24.87,
          92.35
        ],
        [
          24.3333,
          92.0
        ]
      ]
    },
    {
      "u": "Dharmanagar",
      "v": "Kumarghat",
      "origin": "Dharmanagar",
      "destination": "Kumarghat",
      "distance_km": 30.0,
      "highway": "NH-8",
      "terrain": "plain",
      "slope_deg": 1.0,
      "condition": "good",
      "speed_kmh": 60.0,
      "delta_h": 7.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.037,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 25.5,
      "safest_cost": 27.0,
      "is_urban": true,
      "coordinates": [
        [
          24.3833,
          92.1667
        ],
        [
          24.16,
          92.02
        ]
      ]
    },
    {
      "u": "Kailashahar",
      "v": "Kumarghat",
      "origin": "Kailashahar",
      "destination": "Kumarghat",
      "distance_km": 22.0,
      "highway": "SH-Tripura",
      "terrain": "plain",
      "slope_deg": 1.0,
      "condition": "good",
      "speed_kmh": 45.0,
      "delta_h": 5.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.135,
      "hierarchy_weight": 1.0,
      "fastest_time_min": 29.3,
      "safest_cost": 26.4,
      "is_urban": true,
      "coordinates": [
        [
          24.3333,
          92.0
        ],
        [
          24.16,
          92.02
        ]
      ]
    },
    {
      "u": "Kumarghat",
      "v": "Ambassa",
      "origin": "Kumarghat",
      "destination": "Ambassa",
      "distance_km": 50.0,
      "highway": "NH-8",
      "terrain": "hilly",
      "slope_deg": 3.0,
      "condition": "good",
      "speed_kmh": 38.5,
      "delta_h": 32.0,
      "gradient_factor": 1.001,
      "tortuosity": 1.558,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 66.3,
      "safest_cost": 88.9,
      "is_urban": true,
      "coordinates": [
        [
          24.16,
          92.02
        ],
        [
          23.9167,
          91.85
        ]
      ]
    },
    {
      "u": "Kanchanpur",
      "v": "Ambassa",
      "origin": "Kanchanpur",
      "destination": "Ambassa",
      "distance_km": 55.0,
      "highway": "Tripura SH",
      "terrain": "hilly",
      "slope_deg": 3.5,
      "condition": "good",
      "speed_kmh": 31.3,
      "delta_h": 15.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.438,
      "hierarchy_weight": 1.0,
      "fastest_time_min": 105.6,
      "safest_cost": 121.5,
      "is_urban": true,
      "coordinates": [
        [
          23.98,
          92.22
        ],
        [
          23.9167,
          91.85
        ]
      ]
    },
    {
      "u": "Kanchanpur",
      "v": "Dharmanagar",
      "origin": "Kanchanpur",
      "destination": "Dharmanagar",
      "distance_km": 45.0,
      "highway": "Tripura SH",
      "terrain": "hilly",
      "slope_deg": 3.0,
      "condition": "good",
      "speed_kmh": 38.2,
      "delta_h": 54.0,
      "gradient_factor": 1.002,
      "tortuosity": 1.0,
      "hierarchy_weight": 1.0,
      "fastest_time_min": 70.8,
      "safest_cost": 80.7,
      "is_urban": true,
      "coordinates": [
        [
          23.98,
          92.22
        ],
        [
          24.3833,
          92.1667
        ]
      ]
    },
    {
      "u": "Ambassa",
      "v": "Teliamura",
      "origin": "Ambassa",
      "destination": "Teliamura",
      "distance_km": 40.0,
      "highway": "NH-8",
      "terrain": "hilly",
      "slope_deg": 3.0,
      "condition": "good",
      "speed_kmh": 40.8,
      "delta_h": 25.0,
      "gradient_factor": 1.001,
      "tortuosity": 1.471,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 50.1,
      "safest_cost": 67.2,
      "is_urban": true,
      "coordinates": [
        [
          23.9167,
          91.85
        ],
        [
          23.83,
          91.6
        ]
      ]
    },
    {
      "u": "Teliamura",
      "v": "Agartala",
      "origin": "Teliamura",
      "destination": "Agartala",
      "distance_km": 45.0,
      "highway": "NH-8",
      "terrain": "plain",
      "slope_deg": 1.0,
      "condition": "good",
      "speed_kmh": 50.0,
      "delta_h": 23.0,
      "gradient_factor": 1.001,
      "tortuosity": 1.413,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 46.0,
      "safest_cost": 48.7,
      "is_urban": true,
      "coordinates": [
        [
          23.83,
          91.6
        ],
        [
          23.8315,
          91.2868
        ]
      ]
    },
    {
      "u": "Agartala",
      "v": "Bishalgarh",
      "origin": "Agartala",
      "destination": "Bishalgarh",
      "distance_km": 20.0,
      "highway": "NH-8",
      "terrain": "plain",
      "slope_deg": 0.5,
      "condition": "good",
      "speed_kmh": 59.6,
      "delta_h": 8.0,
      "gradient_factor": 1.001,
      "tortuosity": 1.183,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 17.1,
      "safest_cost": 17.9,
      "is_urban": true,
      "coordinates": [
        [
          23.8315,
          91.2868
        ],
        [
          23.68,
          91.3
        ]
      ]
    },
    {
      "u": "Bishalgarh",
      "v": "Udaipur",
      "origin": "Bishalgarh",
      "destination": "Udaipur",
      "distance_km": 30.0,
      "highway": "NH-8",
      "terrain": "plain",
      "slope_deg": 1.0,
      "condition": "good",
      "speed_kmh": 58.3,
      "delta_h": 5.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.21,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 26.2,
      "safest_cost": 27.8,
      "is_urban": true,
      "coordinates": [
        [
          23.68,
          91.3
        ],
        [
          23.5333,
          91.4833
        ]
      ]
    },
    {
      "u": "Udaipur",
      "v": "Belonia",
      "origin": "Udaipur",
      "destination": "Belonia",
      "distance_km": 45.0,
      "highway": "NH-8",
      "terrain": "plain",
      "slope_deg": 1.0,
      "condition": "good",
      "speed_kmh": 49.7,
      "delta_h": 2.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.42,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 46.2,
      "safest_cost": 48.9,
      "is_urban": true,
      "coordinates": [
        [
          23.5333,
          91.4833
        ],
        [
          23.25,
          91.45
        ]
      ]
    },
    {
      "u": "Belonia",
      "v": "Sabroom",
      "origin": "Belonia",
      "destination": "Sabroom",
      "distance_km": 40.0,
      "highway": "NH-8",
      "terrain": "plain",
      "slope_deg": 1.0,
      "condition": "good",
      "speed_kmh": 60.0,
      "delta_h": 2.0,
      "gradient_factor": 1.0,
      "tortuosity": 1.059,
      "hierarchy_weight": 0.85,
      "fastest_time_min": 34.0,
      "safest_cost": 36.0,
      "is_urban": true,
      "coordinates": [
        [
          23.25,
          91.45
        ],
        [
          23.0,
          91.7
        ]
      ]
    }
  ]
};
export default TRIPURA_DENSE_GRAPH;
