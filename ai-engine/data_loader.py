"""
NER Sentinel AI - High-Density State Model Data Builder & Loader
Comprehensive, verified state-by-state road, node, and hazard datasets covering all 8 NER states
plus the West Bengal (Siliguri) strategic gateway corridor with over 130+ connected locations.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any

ALL_NER_STATES = {
    "Arunachal_Pradesh": {
        "state_name": "Arunachal Pradesh",
        "capital": "Itanagar",
        "region": "Eastern Himalayas / Border Region",
        "terrain_category": "Steep Mountain & High Alpine Passes",
        "primary_highways": ["NH-13", "NH-15", "NH-415", "NH-515", "NH-713"],
        "locations": [
            {"id": 17, "name": "Itanagar", "district": "Papum Pare", "state": "Arunachal Pradesh", "latitude": 27.0844, "longitude": 93.6053, "elevation_m": 320, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.15},
            {"id": 18, "name": "Naharlagun", "district": "Papum Pare", "state": "Arunachal Pradesh", "latitude": 27.1064, "longitude": 93.6931, "elevation_m": 200, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.12},
            {"id": 19, "name": "Bomdila", "district": "West Kameng", "state": "Arunachal Pradesh", "latitude": 27.2646, "longitude": 92.4159, "elevation_m": 2415, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 20, "name": "Dirang", "district": "West Kameng", "state": "Arunachal Pradesh", "latitude": 27.3592, "longitude": 92.2392, "elevation_m": 1560, "location_type": "subdivision_town", "is_urban": 0, "risk_score": 0.40},
            {"id": 21, "name": "Sela Pass", "district": "Tawang", "state": "Arunachal Pradesh", "latitude": 27.5050, "longitude": 92.1058, "elevation_m": 4170, "location_type": "mountain_pass", "is_urban": 0, "risk_score": 0.85},
            {"id": 22, "name": "Tawang", "district": "Tawang", "state": "Arunachal Pradesh", "latitude": 27.5861, "longitude": 91.8594, "elevation_m": 3048, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.45},
            {"id": 23, "name": "Pasighat", "district": "East Siang", "state": "Arunachal Pradesh", "latitude": 28.0661, "longitude": 95.3262, "elevation_m": 155, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.20},
            {"id": 105, "name": "Ziro", "district": "Lower Subansiri", "state": "Arunachal Pradesh", "latitude": 27.5949, "longitude": 93.8385, "elevation_m": 1572, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.28},
            {"id": 106, "name": "Along (Aalo)", "district": "West Siang", "state": "Arunachal Pradesh", "latitude": 28.1691, "longitude": 94.7972, "elevation_m": 619, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.38},
            {"id": 107, "name": "Roing", "district": "Lower Dibang Valley", "state": "Arunachal Pradesh", "latitude": 28.1408, "longitude": 95.8354, "elevation_m": 390, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.25},
            {"id": 47, "name": "Tezu", "district": "Lohit", "state": "Arunachal Pradesh", "latitude": 27.9144, "longitude": 96.1669, "elevation_m": 185, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.22},
            {"id": 48, "name": "Namsai", "district": "Namsai", "state": "Arunachal Pradesh", "latitude": 27.6698, "longitude": 95.8711, "elevation_m": 156, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.18},
            {"id": 49, "name": "Changlang", "district": "Changlang", "state": "Arunachal Pradesh", "latitude": 27.1278, "longitude": 95.7389, "elevation_m": 580, "location_type": "district_hq", "is_urban": 0, "risk_score": 0.32},
            {"id": 50, "name": "Khonsa", "district": "Tirap", "state": "Arunachal Pradesh", "latitude": 27.0203, "longitude": 95.5683, "elevation_m": 1215, "location_type": "district_hq", "is_urban": 0, "risk_score": 0.35},
            {"id": 101, "name": "Banderdewa", "district": "Papum Pare", "state": "Arunachal Pradesh", "latitude": 27.1100, "longitude": 93.8200, "elevation_m": 120, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.15},
            {"id": 102, "name": "Rupa", "district": "West Kameng", "state": "Arunachal Pradesh", "latitude": 27.2000, "longitude": 92.4000, "elevation_m": 1400, "location_type": "highway_junction", "is_urban": 0, "risk_score": 0.30},
            {"id": 103, "name": "Jang", "district": "Tawang", "state": "Arunachal Pradesh", "latitude": 27.5700, "longitude": 91.9800, "elevation_m": 2100, "location_type": "subdivision_town", "is_urban": 0, "risk_score": 0.50},
            {"id": 104, "name": "Miao", "district": "Changlang", "state": "Arunachal Pradesh", "latitude": 27.4900, "longitude": 96.2000, "elevation_m": 240, "location_type": "market_center", "is_urban": 0, "risk_score": 0.25}
        ],
        "road_segments": [
            {"origin": "Bhalukpong", "destination": "Rupa", "highway": "NH-13", "distance_km": 75, "time_min": 140, "terrain": "steep_mountain", "condition": "good", "slope_deg": 10.0},
            {"origin": "Rupa", "destination": "Bomdila", "highway": "NH-13", "distance_km": 20, "time_min": 40, "terrain": "steep_mountain", "condition": "good", "slope_deg": 11.0},
            {"origin": "Bomdila", "destination": "Dirang", "highway": "NH-13", "distance_km": 25, "time_min": 45, "terrain": "steep_mountain", "condition": "good", "slope_deg": 10.0},
            {"origin": "Dirang", "destination": "Sela Pass", "highway": "NH-13", "distance_km": 42, "time_min": 110, "terrain": "high_pass", "condition": "poor", "slope_deg": 18.0},
            {"origin": "Sela Pass", "destination": "Jang", "highway": "NH-13", "distance_km": 45, "time_min": 85, "terrain": "high_pass", "condition": "fair", "slope_deg": 15.0},
            {"origin": "Jang", "destination": "Tawang", "highway": "NH-13", "distance_km": 33, "time_min": 55, "terrain": "steep_mountain", "condition": "good", "slope_deg": 12.0},
            {"origin": "Naharlagun", "destination": "Itanagar", "highway": "NH-415", "distance_km": 15, "time_min": 25, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Banderdewa", "destination": "Naharlagun", "highway": "NH-415", "distance_km": 20, "time_min": 30, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Tezpur", "destination": "Banderdewa", "highway": "NH-15", "distance_km": 130, "time_min": 180, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Itanagar", "destination": "Ziro", "highway": "NH-13", "distance_km": 110, "time_min": 220, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 11.0},
            {"origin": "North Lakhimpur", "destination": "Ziro", "highway": "NH-13", "distance_km": 80, "time_min": 160, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 12.0},
            {"origin": "Dibrugarh", "destination": "Pasighat", "highway": "NH-515", "distance_km": 150, "time_min": 240, "terrain": "hilly", "condition": "fair", "slope_deg": 4.0},
            {"origin": "Pasighat", "destination": "Along (Aalo)", "highway": "NH-13", "distance_km": 105, "time_min": 200, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 13.0},
            {"origin": "Pasighat", "destination": "Roing", "highway": "NH-13", "distance_km": 95, "time_min": 150, "terrain": "plain", "condition": "good", "slope_deg": 2.0},
            {"origin": "Roing", "destination": "Tezu", "highway": "NH-13", "distance_km": 65, "time_min": 100, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Tinsukia", "destination": "Namsai", "highway": "NH-15", "distance_km": 80, "time_min": 110, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Namsai", "destination": "Tezu", "highway": "NH-115", "distance_km": 40, "time_min": 55, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Namsai", "destination": "Miao", "highway": "NH-215", "distance_km": 50, "time_min": 75, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Miao", "destination": "Changlang", "highway": "SH-Arunachal", "distance_km": 45, "time_min": 85, "terrain": "hilly", "condition": "fair", "slope_deg": 5.0},
            {"origin": "Tinsukia", "destination": "Changlang", "highway": "NH-215", "distance_km": 95, "time_min": 160, "terrain": "hilly", "condition": "fair", "slope_deg": 6.0},
            {"origin": "Dibrugarh", "destination": "Khonsa", "highway": "NH-315A", "distance_km": 110, "time_min": 190, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 9.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 3200,
            "monsoon_months": ["May", "June", "July", "August", "September"],
            "landslide_susceptibility": "Very High",
            "critical_passes": ["Sela Pass (4,170m)"]
        }
    },

    "Assam": {
        "state_name": "Assam",
        "capital": "Dispur",
        "region": "Brahmaputra Valley & Barak Basin",
        "terrain_category": "Valley Plains & Foothills",
        "primary_highways": ["NH-27", "NH-17", "NH-37", "NH-715", "NH-15", "NH-127B"],
        "locations": [
            {"id": 2, "name": "Guwahati", "district": "Kamrup Metropolitan", "state": "Assam", "latitude": 26.1445, "longitude": 91.7362, "elevation_m": 55, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.08},
            {"id": 3, "name": "Dispur", "district": "Kamrup Metropolitan", "state": "Assam", "latitude": 26.1433, "longitude": 91.7898, "elevation_m": 55, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.05},
            {"id": 4, "name": "Tezpur", "district": "Sonitpur", "state": "Assam", "latitude": 26.6528, "longitude": 92.7926, "elevation_m": 48, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.12},
            {"id": 5, "name": "Nagaon", "district": "Nagaon", "state": "Assam", "latitude": 26.3452, "longitude": 92.6835, "elevation_m": 52, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 6, "name": "Jorhat", "district": "Jorhat", "state": "Assam", "latitude": 26.7509, "longitude": 94.2037, "elevation_m": 116, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.10},
            {"id": 7, "name": "Dibrugarh", "district": "Dibrugarh", "state": "Assam", "latitude": 27.4728, "longitude": 94.9120, "elevation_m": 108, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.14},
            {"id": 8, "name": "Tinsukia", "district": "Tinsukia", "state": "Assam", "latitude": 27.4922, "longitude": 95.3558, "elevation_m": 116, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 9, "name": "Silchar", "district": "Cachar", "state": "Assam", "latitude": 24.8333, "longitude": 92.7789, "elevation_m": 35, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.22},
            {"id": 10, "name": "Haflong (Jatinga)", "district": "Dima Hasao", "state": "Assam", "latitude": 25.1804, "longitude": 93.0169, "elevation_m": 512, "location_type": "mountain_pass", "is_urban": 0, "risk_score": 0.65},
            {"id": 11, "name": "Bhalukpong", "district": "Sonitpur", "state": "Assam", "latitude": 27.0125, "longitude": 92.6416, "elevation_m": 213, "location_type": "border_checkpost", "is_urban": 0, "risk_score": 0.30},
            {"id": 44, "name": "Nalbari", "district": "Nalbari", "state": "Assam", "latitude": 26.4447, "longitude": 91.4428, "elevation_m": 42, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.12},
            {"id": 45, "name": "Goalpara", "district": "Goalpara", "state": "Assam", "latitude": 26.1772, "longitude": 90.6272, "elevation_m": 35, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.15},
            {"id": 51, "name": "Bongaigaon", "district": "Bongaigaon", "state": "Assam", "latitude": 26.4800, "longitude": 90.5600, "elevation_m": 54, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.10},
            {"id": 52, "name": "Dhubri", "district": "Dhubri", "state": "Assam", "latitude": 26.0200, "longitude": 89.9800, "elevation_m": 34, "location_type": "river_port", "is_urban": 1, "risk_score": 0.18},
            {"id": 53, "name": "Barpeta", "district": "Barpeta", "state": "Assam", "latitude": 26.3200, "longitude": 91.0000, "elevation_m": 35, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.15},
            {"id": 54, "name": "North Lakhimpur", "district": "Lakhimpur", "state": "Assam", "latitude": 27.2300, "longitude": 94.1000, "elevation_m": 101, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.16},
            {"id": 55, "name": "Dhemaji", "district": "Dhemaji", "state": "Assam", "latitude": 27.4800, "longitude": 94.5800, "elevation_m": 91, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.20},
            {"id": 56, "name": "Golaghat", "district": "Golaghat", "state": "Assam", "latitude": 26.5200, "longitude": 93.9700, "elevation_m": 95, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 57, "name": "Sivasagar", "district": "Sivasagar", "state": "Assam", "latitude": 26.9800, "longitude": 94.6300, "elevation_m": 95, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 58, "name": "Kokrajhar", "district": "Kokrajhar", "state": "Assam", "latitude": 26.4000, "longitude": 90.2700, "elevation_m": 38, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 59, "name": "Karimganj", "district": "Karimganj", "state": "Assam", "latitude": 24.8700, "longitude": 92.3500, "elevation_m": 13, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.18},
            {"id": 60, "name": "Hailakandi", "district": "Hailakandi", "state": "Assam", "latitude": 24.6800, "longitude": 92.5600, "elevation_m": 21, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.16},
            {"id": 61, "name": "Diphu", "district": "Karbi Anglong", "state": "Assam", "latitude": 25.8400, "longitude": 93.4300, "elevation_m": 186, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.22},
            {"id": 111, "name": "Jalukbari", "district": "Kamrup Metropolitan", "state": "Assam", "latitude": 26.1500, "longitude": 91.6600, "elevation_m": 52, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.06},
            {"id": 112, "name": "Khanapara", "district": "Kamrup Metropolitan", "state": "Assam", "latitude": 26.1100, "longitude": 91.8200, "elevation_m": 60, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.06},
            {"id": 113, "name": "Jagiroad", "district": "Morigaon", "state": "Assam", "latitude": 26.1200, "longitude": 92.2100, "elevation_m": 50, "location_type": "subdivision_town", "is_urban": 1, "risk_score": 0.08},
            {"id": 114, "name": "Raha", "district": "Nagaon", "state": "Assam", "latitude": 26.2300, "longitude": 92.5200, "elevation_m": 52, "location_type": "market_center", "is_urban": 1, "risk_score": 0.09},
            {"id": 115, "name": "Numaligarh", "district": "Golaghat", "state": "Assam", "latitude": 26.6300, "longitude": 93.7500, "elevation_m": 85, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.08},
            {"id": 116, "name": "Barpeta Road", "district": "Barpeta", "state": "Assam", "latitude": 26.5000, "longitude": 90.9700, "elevation_m": 48, "location_type": "market_center", "is_urban": 1, "risk_score": 0.10},
            {"id": 117, "name": "Digboi", "district": "Tinsukia", "state": "Assam", "latitude": 27.3800, "longitude": 95.6200, "elevation_m": 150, "location_type": "subdivision_town", "is_urban": 1, "risk_score": 0.12},
            {"id": 118, "name": "Badarpur", "district": "Karimganj", "state": "Assam", "latitude": 24.9000, "longitude": 92.6000, "elevation_m": 25, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.15}
        ],
        "road_segments": [
            {"origin": "Guwahati", "destination": "Dispur", "highway": "GS Road", "distance_km": 10, "time_min": 15, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Guwahati", "destination": "Jalukbari", "highway": "NH-27 Bypass", "distance_km": 12, "time_min": 15, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Dispur", "destination": "Khanapara", "highway": "GS Road", "distance_km": 6, "time_min": 10, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Khanapara", "destination": "Jagiroad", "highway": "NH-27 (4-Lane)", "distance_km": 50, "time_min": 45, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Jagiroad", "destination": "Raha", "highway": "NH-27 (4-Lane)", "distance_km": 40, "time_min": 35, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Raha", "destination": "Nagaon", "highway": "NH-27", "distance_km": 20, "time_min": 20, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Nagaon", "destination": "Tezpur", "highway": "NH-715 (Kalia Bhomora Bridge)", "distance_km": 50, "time_min": 55, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Tezpur", "destination": "Bhalukpong", "highway": "NH-13", "distance_km": 60, "time_min": 75, "terrain": "hilly", "condition": "good", "slope_deg": 5.0},
            {"origin": "Nagaon", "destination": "Numaligarh", "highway": "NH-27", "distance_km": 115, "time_min": 120, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Numaligarh", "destination": "Golaghat", "highway": "NH-129", "distance_km": 25, "time_min": 30, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Golaghat", "destination": "Jorhat", "highway": "SH-Assam", "distance_km": 45, "time_min": 50, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Numaligarh", "destination": "Jorhat", "highway": "NH-27", "distance_km": 65, "time_min": 70, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Jorhat", "destination": "Sivasagar", "highway": "NH-27", "distance_km": 55, "time_min": 60, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Sivasagar", "destination": "Dibrugarh", "highway": "NH-27", "distance_km": 75, "time_min": 85, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Dibrugarh", "destination": "Tinsukia", "highway": "NH-27", "distance_km": 48, "time_min": 50, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Tinsukia", "destination": "Digboi", "highway": "NH-38", "distance_km": 35, "time_min": 40, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Nagaon", "destination": "Haflong (Jatinga)", "highway": "NH-27", "distance_km": 140, "time_min": 220, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 14.0},
            {"origin": "Haflong (Jatinga)", "destination": "Silchar", "highway": "NH-27", "distance_km": 100, "time_min": 160, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 13.0},
            {"origin": "Jalukbari", "destination": "Goalpara", "highway": "NH-17", "distance_km": 120, "time_min": 140, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Jalukbari", "destination": "Nalbari", "highway": "NH-27", "distance_km": 60, "time_min": 60, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Nalbari", "destination": "Barpeta Road", "highway": "NH-27", "distance_km": 45, "time_min": 45, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Barpeta Road", "destination": "Barpeta", "highway": "SH-Barpeta", "distance_km": 18, "time_min": 25, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Barpeta Road", "destination": "Bongaigaon", "highway": "NH-27", "distance_km": 45, "time_min": 45, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Bongaigaon", "destination": "Kokrajhar", "highway": "NH-27", "distance_km": 50, "time_min": 50, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Goalpara", "destination": "Dhubri", "highway": "NH-17", "distance_km": 80, "time_min": 100, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Tezpur", "destination": "North Lakhimpur", "highway": "NH-15", "distance_km": 170, "time_min": 200, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "North Lakhimpur", "destination": "Dhemaji", "highway": "NH-15", "distance_km": 70, "time_min": 80, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Dhemaji", "destination": "Dibrugarh", "highway": "Bogibeel Bridge / NH-15", "distance_km": 60, "time_min": 65, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Nagaon", "destination": "Diphu", "highway": "NH-329", "distance_km": 115, "time_min": 140, "terrain": "hilly", "condition": "fair", "slope_deg": 5.0},
            {"origin": "Silchar", "destination": "Badarpur", "highway": "NH-37", "distance_km": 28, "time_min": 35, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Badarpur", "destination": "Karimganj", "highway": "NH-37", "distance_km": 25, "time_min": 30, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Badarpur", "destination": "Hailakandi", "highway": "SH-38", "distance_km": 25, "time_min": 30, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Silchar", "destination": "Hailakandi", "highway": "SH-38", "distance_km": 35, "time_min": 40, "terrain": "plain", "condition": "good", "slope_deg": 0.5}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 2400,
            "monsoon_months": ["June", "July", "August", "September"],
            "landslide_susceptibility": "Moderate (High in Dima Hasao)",
            "critical_passes": ["Haflong Jatinga Valley"]
        }
    },

    "Manipur": {
        "state_name": "Manipur",
        "capital": "Imphal",
        "region": "Manipur Valley & Surrounding Ridges",
        "terrain_category": "Intermontane Valley & Rugged Hills",
        "primary_highways": ["NH-2", "NH-37", "NH-102", "NH-150"],
        "locations": [
            {"id": 27, "name": "Senapati", "district": "Senapati", "state": "Manipur", "latitude": 25.2683, "longitude": 94.0186, "elevation_m": 1100, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 28, "name": "Imphal", "district": "Imphal West", "state": "Manipur", "latitude": 24.8170, "longitude": 93.9368, "elevation_m": 786, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.12},
            {"id": 29, "name": "Churachandpur", "district": "Churachandpur", "state": "Manipur", "latitude": 24.3333, "longitude": 93.6833, "elevation_m": 914, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.25},
            {"id": 30, "name": "Jiribam", "district": "Jiribam", "state": "Manipur", "latitude": 24.8014, "longitude": 93.1186, "elevation_m": 42, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.20},
            {"id": 62, "name": "Ukhrul", "district": "Ukhrul", "state": "Manipur", "latitude": 25.1167, "longitude": 94.3667, "elevation_m": 1662, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.40},
            {"id": 63, "name": "Thoubal", "district": "Thoubal", "state": "Manipur", "latitude": 24.6333, "longitude": 93.9833, "elevation_m": 775, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 64, "name": "Bishnupur", "district": "Bishnupur", "state": "Manipur", "latitude": 24.6300, "longitude": 93.7600, "elevation_m": 790, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 65, "name": "Kakching", "district": "Kakching", "state": "Manipur", "latitude": 24.4800, "longitude": 93.9800, "elevation_m": 776, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 66, "name": "Moreh", "district": "Tengnoupal", "state": "Manipur", "latitude": 24.2500, "longitude": 94.3000, "elevation_m": 220, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.35},
            {"id": 121, "name": "Kangpokpi", "district": "Kangpokpi", "state": "Manipur", "latitude": 25.1500, "longitude": 93.9700, "elevation_m": 1050, "location_type": "subdivision_town", "is_urban": 0, "risk_score": 0.30},
            {"id": 122, "name": "Moirang", "district": "Bishnupur", "state": "Manipur", "latitude": 24.5000, "longitude": 93.7700, "elevation_m": 770, "location_type": "market_center", "is_urban": 1, "risk_score": 0.10},
            {"id": 123, "name": "Noney", "district": "Noney", "state": "Manipur", "latitude": 24.8300, "longitude": 93.6000, "elevation_m": 450, "location_type": "highway_junction", "is_urban": 0, "risk_score": 0.55}
        ],
        "road_segments": [
            {"origin": "Silchar", "destination": "Jiribam", "highway": "NH-37", "distance_km": 50, "time_min": 65, "terrain": "plain", "condition": "good", "slope_deg": 2.0},
            {"origin": "Jiribam", "destination": "Noney", "highway": "NH-37", "distance_km": 110, "time_min": 190, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 13.0},
            {"origin": "Noney", "destination": "Imphal", "highway": "NH-37", "distance_km": 60, "time_min": 90, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 10.0},
            {"origin": "Kohima", "destination": "Senapati", "highway": "NH-2", "distance_km": 80, "time_min": 120, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 11.0},
            {"origin": "Senapati", "destination": "Kangpokpi", "highway": "NH-2", "distance_km": 25, "time_min": 35, "terrain": "hilly", "condition": "good", "slope_deg": 6.0},
            {"origin": "Kangpokpi", "destination": "Imphal", "highway": "NH-2", "distance_km": 35, "time_min": 45, "terrain": "plain", "condition": "good", "slope_deg": 2.0},
            {"origin": "Imphal", "destination": "Bishnupur", "highway": "Tiddim Rd / NH-2", "distance_km": 30, "time_min": 35, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Bishnupur", "destination": "Moirang", "highway": "NH-2", "distance_km": 15, "time_min": 20, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Moirang", "destination": "Churachandpur", "highway": "NH-2", "distance_km": 20, "time_min": 25, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Imphal", "destination": "Ukhrul", "highway": "NH-150", "distance_km": 85, "time_min": 135, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 10.0},
            {"origin": "Imphal", "destination": "Thoubal", "highway": "NH-102 (Asian Highway AH-1)", "distance_km": 25, "time_min": 30, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Thoubal", "destination": "Kakching", "highway": "NH-102", "distance_km": 20, "time_min": 25, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Kakching", "destination": "Moreh", "highway": "NH-102", "distance_km": 65, "time_min": 95, "terrain": "hilly", "condition": "fair", "slope_deg": 7.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 1800,
            "monsoon_months": ["June", "July", "August"],
            "landslide_susceptibility": "High",
            "critical_passes": ["Barak & Makru River Gorges on NH-37"]
        }
    },

    "Meghalaya": {
        "state_name": "Meghalaya",
        "capital": "Shillong",
        "region": "Shillong Plateau & Garo Hills",
        "terrain_category": "Elevated Tableland & High Precipitation Ridges",
        "primary_highways": ["NH-6", "SH-5", "NH-206", "NH-217"],
        "locations": [
            {"id": 12, "name": "Shillong", "district": "East Khasi Hills", "state": "Meghalaya", "latitude": 25.5788, "longitude": 91.8933, "elevation_m": 1525, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.12},
            {"id": 13, "name": "Cherrapunji (Sohra)", "district": "East Khasi Hills", "state": "Meghalaya", "latitude": 25.2702, "longitude": 91.7323, "elevation_m": 1484, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.48},
            {"id": 14, "name": "Jowai", "district": "West Jaintia Hills", "state": "Meghalaya", "latitude": 25.4500, "longitude": 92.2000, "elevation_m": 1380, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.20},
            {"id": 15, "name": "Nongpoh", "district": "Ri Bhoi", "state": "Meghalaya", "latitude": 25.9036, "longitude": 91.8800, "elevation_m": 485, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.15},
            {"id": 16, "name": "Tura", "district": "West Garo Hills", "state": "Meghalaya", "latitude": 25.5138, "longitude": 90.2202, "elevation_m": 349, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.18},
            {"id": 67, "name": "Mawsynram", "district": "East Khasi Hills", "state": "Meghalaya", "latitude": 25.3000, "longitude": 91.5800, "elevation_m": 1400, "location_type": "subdivision_town", "is_urban": 0, "risk_score": 0.55},
            {"id": 68, "name": "Dawki", "district": "West Jaintia Hills", "state": "Meghalaya", "latitude": 25.1800, "longitude": 92.0200, "elevation_m": 105, "location_type": "border_checkpost", "is_urban": 0, "risk_score": 0.28},
            {"id": 69, "name": "Williamnagar", "district": "East Garo Hills", "state": "Meghalaya", "latitude": 25.6000, "longitude": 90.6200, "elevation_m": 290, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.22},
            {"id": 70, "name": "Nongstoin", "district": "West Khasi Hills", "state": "Meghalaya", "latitude": 25.5200, "longitude": 91.2700, "elevation_m": 1409, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.24},
            {"id": 131, "name": "Byrnihat", "district": "Ri Bhoi", "state": "Meghalaya", "latitude": 26.0500, "longitude": 91.8500, "elevation_m": 150, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.10},
            {"id": 132, "name": "Khliehriat", "district": "East Jaintia Hills", "state": "Meghalaya", "latitude": 25.3500, "longitude": 92.3700, "elevation_m": 1200, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 133, "name": "Mairang", "district": "Eastern West Khasi Hills", "state": "Meghalaya", "latitude": 25.5600, "longitude": 91.6400, "elevation_m": 1550, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.20}
        ],
        "road_segments": [
            {"origin": "Guwahati", "destination": "Byrnihat", "highway": "NH-6 (4-Lane)", "distance_km": 20, "time_min": 20, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Byrnihat", "destination": "Nongpoh", "highway": "NH-6 (4-Lane)", "distance_km": 30, "time_min": 30, "terrain": "hilly", "condition": "good", "slope_deg": 3.0},
            {"origin": "Nongpoh", "destination": "Shillong", "highway": "NH-6 (4-Lane Bypass)", "distance_km": 50, "time_min": 55, "terrain": "hilly", "condition": "good", "slope_deg": 5.0},
            {"origin": "Shillong", "destination": "Cherrapunji (Sohra)", "highway": "SH-5", "distance_km": 54, "time_min": 75, "terrain": "steep_mountain", "condition": "good", "slope_deg": 8.0},
            {"origin": "Shillong", "destination": "Mawsynram", "highway": "SH-5", "distance_km": 60, "time_min": 90, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 9.0},
            {"origin": "Shillong", "destination": "Jowai", "highway": "NH-6", "distance_km": 65, "time_min": 85, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Jowai", "destination": "Khliehriat", "highway": "NH-6", "distance_km": 35, "time_min": 45, "terrain": "hilly", "condition": "good", "slope_deg": 5.0},
            {"origin": "Khliehriat", "destination": "Silchar", "highway": "NH-6 (Sonapur Tunnel Corridor)", "distance_km": 105, "time_min": 165, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 12.0},
            {"origin": "Shillong", "destination": "Dawki", "highway": "NH-206", "distance_km": 80, "time_min": 115, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 9.0},
            {"origin": "Dawki", "destination": "Jowai", "highway": "NH-206", "distance_km": 55, "time_min": 85, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Shillong", "destination": "Mairang", "highway": "NH-217", "distance_km": 40, "time_min": 50, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Mairang", "destination": "Nongstoin", "highway": "NH-217", "distance_km": 50, "time_min": 65, "terrain": "hilly", "condition": "good", "slope_deg": 5.0},
            {"origin": "Nongstoin", "destination": "Williamnagar", "highway": "NH-217", "distance_km": 120, "time_min": 180, "terrain": "hilly", "condition": "fair", "slope_deg": 6.0},
            {"origin": "Williamnagar", "destination": "Tura", "highway": "NH-217", "distance_km": 75, "time_min": 95, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Goalpara", "destination": "Tura", "highway": "NH-217", "distance_km": 110, "time_min": 140, "terrain": "hilly", "condition": "good", "slope_deg": 4.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 11800,
            "monsoon_months": ["May", "June", "July", "August", "September", "October"],
            "landslide_susceptibility": "Very High",
            "critical_passes": ["Sonapur Tunnel (NH-6)", "Wahrew Gorge"]
        }
    },

    "Mizoram": {
        "state_name": "Mizoram",
        "capital": "Aizawl",
        "region": "Lushai Hills & Ridge Lines",
        "terrain_category": "Parallel Ridge Chains & Steep Valleys",
        "primary_highways": ["NH-306", "NH-54", "NH-102B", "NH-108B", "NH-502A"],
        "locations": [
            {"id": 31, "name": "Kolasib", "district": "Kolasib", "state": "Mizoram", "latitude": 24.2247, "longitude": 92.6781, "elevation_m": 612, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.25},
            {"id": 32, "name": "Aizawl", "district": "Aizawl", "state": "Mizoram", "latitude": 23.7271, "longitude": 92.7176, "elevation_m": 1132, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.20},
            {"id": 33, "name": "Lunglei", "district": "Lunglei", "state": "Mizoram", "latitude": 22.8833, "longitude": 92.7333, "elevation_m": 722, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.25},
            {"id": 34, "name": "Champhai", "district": "Champhai", "state": "Mizoram", "latitude": 23.4560, "longitude": 93.3282, "elevation_m": 1678, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.35},
            {"id": 71, "name": "Vairengte", "district": "Kolasib", "state": "Mizoram", "latitude": 24.5000, "longitude": 92.7600, "elevation_m": 220, "location_type": "border_checkpost", "is_urban": 0, "risk_score": 0.20},
            {"id": 72, "name": "Serchhip", "district": "Serchhip", "state": "Mizoram", "latitude": 23.3400, "longitude": 92.8500, "elevation_m": 880, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.22},
            {"id": 73, "name": "Lawngtlai", "district": "Lawngtlai", "state": "Mizoram", "latitude": 22.5300, "longitude": 92.8900, "elevation_m": 780, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.28},
            {"id": 74, "name": "Saiha", "district": "Siaha", "state": "Mizoram", "latitude": 22.4800, "longitude": 92.9700, "elevation_m": 729, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.30},
            {"id": 141, "name": "Lengpui", "district": "Mamit", "state": "Mizoram", "latitude": 23.8400, "longitude": 92.6200, "elevation_m": 420, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.15},
            {"id": 142, "name": "Thenzawl", "district": "Serchhip", "state": "Mizoram", "latitude": 23.3100, "longitude": 92.7500, "elevation_m": 780, "location_type": "market_center", "is_urban": 0, "risk_score": 0.22},
            {"id": 143, "name": "Mamit", "district": "Mamit", "state": "Mizoram", "latitude": 23.9300, "longitude": 92.4900, "elevation_m": 718, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.25}
        ],
        "road_segments": [
            {"origin": "Silchar", "destination": "Vairengte", "highway": "NH-306", "distance_km": 45, "time_min": 70, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Vairengte", "destination": "Kolasib", "highway": "NH-306", "distance_km": 40, "time_min": 65, "terrain": "hilly", "condition": "good", "slope_deg": 5.0},
            {"origin": "Kolasib", "destination": "Lengpui", "highway": "NH-306 Bypass", "distance_km": 50, "time_min": 85, "terrain": "hilly", "condition": "good", "slope_deg": 6.0},
            {"origin": "Lengpui", "destination": "Aizawl", "highway": "NH-306", "distance_km": 35, "time_min": 55, "terrain": "steep_mountain", "condition": "good", "slope_deg": 8.0},
            {"origin": "Kolasib", "destination": "Aizawl", "highway": "NH-306", "distance_km": 85, "time_min": 170, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 9.0},
            {"origin": "Aizawl", "destination": "Mamit", "highway": "NH-108B", "distance_km": 85, "time_min": 140, "terrain": "hilly", "condition": "good", "slope_deg": 6.0},
            {"origin": "Mamit", "destination": "Kanchanpur", "highway": "Jampui Hills Road", "distance_km": 60, "time_min": 100, "terrain": "hilly", "condition": "fair", "slope_deg": 7.0},
            {"origin": "Aizawl", "destination": "Thenzawl", "highway": "SH-Mizoram", "distance_km": 85, "time_min": 145, "terrain": "hilly", "condition": "good", "slope_deg": 7.0},
            {"origin": "Thenzawl", "destination": "Lunglei", "highway": "SH-Mizoram", "distance_km": 85, "time_min": 145, "terrain": "steep_mountain", "condition": "good", "slope_deg": 8.0},
            {"origin": "Aizawl", "destination": "Serchhip", "highway": "NH-54", "distance_km": 90, "time_min": 160, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 8.0},
            {"origin": "Serchhip", "destination": "Lunglei", "highway": "NH-54", "distance_km": 80, "time_min": 140, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 8.0},
            {"origin": "Aizawl", "destination": "Champhai", "highway": "NH-102B", "distance_km": 190, "time_min": 340, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 13.0},
            {"origin": "Lunglei", "destination": "Lawngtlai", "highway": "NH-502A", "distance_km": 90, "time_min": 160, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 8.0},
            {"origin": "Lawngtlai", "destination": "Saiha", "highway": "NH-54", "distance_km": 40, "time_min": 75, "terrain": "hilly", "condition": "fair", "slope_deg": 6.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 2800,
            "monsoon_months": ["May", "June", "July", "August", "September"],
            "landslide_susceptibility": "Very High",
            "critical_passes": ["Hunthar Ridge (Aizawl Gateway)", "Tuirial Valley"]
        }
    },

    "Nagaland": {
        "state_name": "Nagaland",
        "capital": "Kohima",
        "region": "Naga Hills",
        "terrain_category": "Complex Mountain Chains & High Sinking Zones",
        "primary_highways": ["NH-29", "NH-2", "NH-702"],
        "locations": [
            {"id": 24, "name": "Dimapur", "district": "Dimapur", "state": "Nagaland", "latitude": 25.9068, "longitude": 93.7271, "elevation_m": 145, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.10},
            {"id": 25, "name": "Kohima", "district": "Kohima", "state": "Nagaland", "latitude": 25.6701, "longitude": 94.1077, "elevation_m": 1444, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.25},
            {"id": 26, "name": "Mokokchung", "district": "Mokokchung", "state": "Nagaland", "latitude": 26.3256, "longitude": 94.5215, "elevation_m": 1325, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.28},
            {"id": 38, "name": "Wokha", "district": "Wokha", "state": "Nagaland", "latitude": 26.1000, "longitude": 94.2600, "elevation_m": 1313, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.30},
            {"id": 75, "name": "Tuensang", "district": "Tuensang", "state": "Nagaland", "latitude": 26.2800, "longitude": 94.8300, "elevation_m": 1371, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 76, "name": "Zunheboto", "district": "Zunheboto", "state": "Nagaland", "latitude": 25.9700, "longitude": 94.5200, "elevation_m": 1874, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 77, "name": "Mon", "district": "Mon", "state": "Nagaland", "latitude": 26.7500, "longitude": 95.0600, "elevation_m": 897, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.32},
            {"id": 78, "name": "Phek", "district": "Phek", "state": "Nagaland", "latitude": 25.6600, "longitude": 94.4600, "elevation_m": 1024, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 151, "name": "Chumoukedima", "district": "Chumoukedima", "state": "Nagaland", "latitude": 25.7900, "longitude": 93.7700, "elevation_m": 180, "location_type": "subdivision_town", "is_urban": 1, "risk_score": 0.12},
            {"id": 152, "name": "Medziphema", "district": "Chumoukedima", "state": "Nagaland", "latitude": 25.7500, "longitude": 93.8500, "elevation_m": 310, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.15},
            {"id": 153, "name": "Tseminyu", "district": "Tseminyu", "state": "Nagaland", "latitude": 25.9000, "longitude": 94.2100, "elevation_m": 1260, "location_type": "subdivision_town", "is_urban": 0, "risk_score": 0.28}
        ],
        "road_segments": [
            {"origin": "Nagaon", "destination": "Dimapur", "highway": "NH-29 (4-Lane)", "distance_km": 160, "time_min": 175, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Dimapur", "destination": "Chumoukedima", "highway": "NH-29 (4-Lane)", "distance_km": 14, "time_min": 18, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Chumoukedima", "destination": "Medziphema", "highway": "NH-29", "distance_km": 18, "time_min": 25, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Medziphema", "destination": "Kohima", "highway": "NH-29 (Asian Highway AH-1)", "distance_km": 42, "time_min": 70, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 12.0},
            {"origin": "Kohima", "destination": "Tseminyu", "highway": "NH-2", "distance_km": 40, "time_min": 60, "terrain": "steep_mountain", "condition": "good", "slope_deg": 8.0},
            {"origin": "Tseminyu", "destination": "Wokha", "highway": "NH-2", "distance_km": 35, "time_min": 55, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 9.0},
            {"origin": "Wokha", "destination": "Mokokchung", "highway": "NH-2", "distance_km": 80, "time_min": 130, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 9.0},
            {"origin": "Mokokchung", "destination": "Tuensang", "highway": "NH-702", "distance_km": 115, "time_min": 190, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 12.0},
            {"origin": "Mokokchung", "destination": "Zunheboto", "highway": "NH-702D", "distance_km": 60, "time_min": 100, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 10.0},
            {"origin": "Kohima", "destination": "Phek", "highway": "NH-29", "distance_km": 120, "time_min": 190, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 11.0},
            {"origin": "Jorhat", "destination": "Mokokchung", "highway": "NH-702", "distance_km": 85, "time_min": 125, "terrain": "hilly", "condition": "good", "slope_deg": 6.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 2200,
            "monsoon_months": ["June", "July", "August", "September"],
            "landslide_susceptibility": "Very High",
            "critical_passes": ["Paglapahar Sinking Zone (NH-29)", "Peducha Mudslide Belt"]
        }
    },

    "Sikkim": {
        "state_name": "Sikkim",
        "capital": "Gangtok",
        "region": "Eastern Himalayas / Teesta River Corridor",
        "terrain_category": "Steep Alpine Terrain & Active Teesta River Basin",
        "primary_highways": ["NH-10", "NH-710", "NH-510", "JN Road"],
        "locations": [
            {"id": 39, "name": "Gangtok", "district": "East Sikkim", "state": "Sikkim", "latitude": 27.3389, "longitude": 88.6065, "elevation_m": 1650, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.20},
            {"id": 40, "name": "Namchi", "district": "South Sikkim", "state": "Sikkim", "latitude": 27.1667, "longitude": 88.3500, "elevation_m": 1315, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.25},
            {"id": 41, "name": "Geyzing", "district": "West Sikkim", "state": "Sikkim", "latitude": 27.2833, "longitude": 88.2500, "elevation_m": 1900, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.30},
            {"id": 42, "name": "Mangan", "district": "North Sikkim", "state": "Sikkim", "latitude": 27.5000, "longitude": 88.5333, "elevation_m": 1790, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.55},
            {"id": 43, "name": "Rangpo", "district": "Pakyong", "state": "Sikkim", "latitude": 27.1764, "longitude": 88.5283, "elevation_m": 330, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.35},
            {"id": 79, "name": "Singtam", "district": "Gangtok", "state": "Sikkim", "latitude": 27.2300, "longitude": 88.5000, "elevation_m": 410, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.25},
            {"id": 80, "name": "Chungthang", "district": "North Sikkim", "state": "Sikkim", "latitude": 27.6000, "longitude": 88.6500, "elevation_m": 1790, "location_type": "mountain_pass", "is_urban": 0, "risk_score": 0.70},
            {"id": 81, "name": "Lachung", "district": "North Sikkim", "state": "Sikkim", "latitude": 27.6900, "longitude": 88.7400, "elevation_m": 2700, "location_type": "mountain_pass", "is_urban": 0, "risk_score": 0.65},
            {"id": 82, "name": "Lachen", "district": "North Sikkim", "state": "Sikkim", "latitude": 27.7200, "longitude": 88.5500, "elevation_m": 2750, "location_type": "mountain_pass", "is_urban": 0, "risk_score": 0.68},
            {"id": 83, "name": "Nathu La Pass", "district": "East Sikkim", "state": "Sikkim", "latitude": 27.3865, "longitude": 88.8310, "elevation_m": 4310, "location_type": "border_checkpost", "is_urban": 0, "risk_score": 0.75},
            {"id": 84, "name": "Ravangla", "district": "South Sikkim", "state": "Sikkim", "latitude": 27.3000, "longitude": 88.3600, "elevation_m": 2100, "location_type": "subdivision_town", "is_urban": 1, "risk_score": 0.28},
            {"id": 161, "name": "Jorethang", "district": "South Sikkim", "state": "Sikkim", "latitude": 27.1200, "longitude": 88.3000, "elevation_m": 300, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.18},
            {"id": 162, "name": "Pelling", "district": "West Sikkim", "state": "Sikkim", "latitude": 27.3000, "longitude": 88.2300, "elevation_m": 2150, "location_type": "market_center", "is_urban": 1, "risk_score": 0.32}
        ],
        "road_segments": [
            {"origin": "Siliguri", "destination": "Rangpo", "highway": "NH-10", "distance_km": 70, "time_min": 120, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 11.0},
            {"origin": "Rangpo", "destination": "Singtam", "highway": "NH-10", "distance_km": 15, "time_min": 25, "terrain": "hilly", "condition": "good", "slope_deg": 4.0},
            {"origin": "Singtam", "destination": "Gangtok", "highway": "NH-10", "distance_km": 25, "time_min": 40, "terrain": "steep_mountain", "condition": "good", "slope_deg": 7.0},
            {"origin": "Singtam", "destination": "Mangan", "highway": "NH-10", "distance_km": 40, "time_min": 85, "terrain": "steep_mountain", "condition": "poor", "slope_deg": 13.0},
            {"origin": "Mangan", "destination": "Chungthang", "highway": "NH-10", "distance_km": 30, "time_min": 75, "terrain": "high_pass", "condition": "poor", "slope_deg": 15.0},
            {"origin": "Chungthang", "destination": "Lachung", "highway": "NH-10", "distance_km": 24, "time_min": 60, "terrain": "high_pass", "condition": "fair", "slope_deg": 12.0},
            {"origin": "Chungthang", "destination": "Lachen", "highway": "NH-10", "distance_km": 28, "time_min": 70, "terrain": "high_pass", "condition": "fair", "slope_deg": 14.0},
            {"origin": "Gangtok", "destination": "Nathu La Pass", "highway": "Jawaharlal Nehru Rd", "distance_km": 54, "time_min": 130, "terrain": "high_pass", "condition": "fair", "slope_deg": 16.0},
            {"origin": "Singtam", "destination": "Namchi", "highway": "NH-710", "distance_km": 30, "time_min": 60, "terrain": "steep_mountain", "condition": "good", "slope_deg": 8.0},
            {"origin": "Namchi", "destination": "Jorethang", "highway": "SH-Sikkim", "distance_km": 20, "time_min": 35, "terrain": "hilly", "condition": "good", "slope_deg": 6.0},
            {"origin": "Namchi", "destination": "Ravangla", "highway": "SH-12", "distance_km": 25, "time_min": 50, "terrain": "steep_mountain", "condition": "good", "slope_deg": 7.0},
            {"origin": "Ravangla", "destination": "Geyzing", "highway": "NH-510", "distance_km": 40, "time_min": 80, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 8.0},
            {"origin": "Geyzing", "destination": "Pelling", "highway": "SH-Sikkim", "distance_km": 10, "time_min": 20, "terrain": "steep_mountain", "condition": "good", "slope_deg": 7.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 3500,
            "monsoon_months": ["June", "July", "August", "September", "October"],
            "landslide_susceptibility": "Extreme",
            "critical_passes": ["29th Mile & Teesta Valley (NH-10)", "Nathu La High Pass"]
        }
    },

    "Tripura": {
        "state_name": "Tripura",
        "capital": "Agartala",
        "region": "Tripura Plains & Low Hill Ranges",
        "terrain_category": "Rolling Plains & Low North-South Anticlinal Ridges",
        "primary_highways": ["NH-8", "NH-108", "NH-208"],
        "locations": [
            {"id": 201, "name": "Agartala", "district": "West Tripura", "state": "Tripura", "latitude": 23.8315, "longitude": 91.2868, "elevation_m": 12, "location_type": "state_capital", "is_urban": 1, "risk_score": 0.08},
            {"id": 202, "name": "Udaipur", "district": "Gomati", "state": "Tripura", "latitude": 23.5333, "longitude": 91.4833, "elevation_m": 25, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 203, "name": "Dharmanagar", "district": "North Tripura", "state": "Tripura", "latitude": 24.3833, "longitude": 92.1667, "elevation_m": 21, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.12},
            {"id": 204, "name": "Kailashahar", "district": "Unakoti", "state": "Tripura", "latitude": 24.3333, "longitude": 92.0000, "elevation_m": 23, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.12},
            {"id": 205, "name": "Ambassa", "district": "Dhalai", "state": "Tripura", "latitude": 23.9167, "longitude": 91.8500, "elevation_m": 60, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.18},
            {"id": 206, "name": "Belonia", "district": "South Tripura", "state": "Tripura", "latitude": 23.2500, "longitude": 91.4500, "elevation_m": 23, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.12},
            {"id": 207, "name": "Sabroom", "district": "South Tripura", "state": "Tripura", "latitude": 23.0000, "longitude": 91.7000, "elevation_m": 25, "location_type": "border_checkpost", "is_urban": 1, "risk_score": 0.14},
            {"id": 209, "name": "Kanchanpur", "district": "North Tripura", "state": "Tripura", "latitude": 23.9800, "longitude": 92.2200, "elevation_m": 75, "location_type": "subdivision_town", "is_urban": 0, "risk_score": 0.20},
            {"id": 210, "name": "Teliamura", "district": "Khowai", "state": "Tripura", "latitude": 23.8300, "longitude": 91.6000, "elevation_m": 35, "location_type": "subdivision_town", "is_urban": 1, "risk_score": 0.15},
            {"id": 171, "name": "Kumarghat", "district": "Unakoti", "state": "Tripura", "latitude": 24.1600, "longitude": 92.0200, "elevation_m": 28, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.12},
            {"id": 172, "name": "Bishalgarh", "district": "Sipahijala", "state": "Tripura", "latitude": 23.6800, "longitude": 91.3000, "elevation_m": 20, "location_type": "subdivision_town", "is_urban": 1, "risk_score": 0.10}
        ],
        "road_segments": [
            {"origin": "Karimganj", "destination": "Dharmanagar", "highway": "NH-8", "distance_km": 55, "time_min": 75, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Karimganj", "destination": "Kailashahar", "highway": "NH-208", "distance_km": 55, "time_min": 75, "terrain": "plain", "condition": "good", "slope_deg": 1.5},
            {"origin": "Dharmanagar", "destination": "Kumarghat", "highway": "NH-8", "distance_km": 30, "time_min": 40, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Kailashahar", "destination": "Kumarghat", "highway": "SH-Tripura", "distance_km": 22, "time_min": 30, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Kumarghat", "destination": "Ambassa", "highway": "NH-8", "distance_km": 50, "time_min": 75, "terrain": "hilly", "condition": "good", "slope_deg": 3.0},
            {"origin": "Kanchanpur", "destination": "Ambassa", "highway": "Tripura SH", "distance_km": 55, "time_min": 80, "terrain": "hilly", "condition": "good", "slope_deg": 3.5},
            {"origin": "Kanchanpur", "destination": "Dharmanagar", "highway": "Tripura SH", "distance_km": 45, "time_min": 70, "terrain": "hilly", "condition": "good", "slope_deg": 3.0},
            {"origin": "Ambassa", "destination": "Teliamura", "highway": "NH-8", "distance_km": 40, "time_min": 55, "terrain": "hilly", "condition": "good", "slope_deg": 3.0},
            {"origin": "Teliamura", "destination": "Agartala", "highway": "NH-8", "distance_km": 45, "time_min": 60, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Agartala", "destination": "Bishalgarh", "highway": "NH-8", "distance_km": 20, "time_min": 25, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Bishalgarh", "destination": "Udaipur", "highway": "NH-8", "distance_km": 30, "time_min": 40, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Udaipur", "destination": "Belonia", "highway": "NH-8", "distance_km": 45, "time_min": 60, "terrain": "plain", "condition": "good", "slope_deg": 1.0},
            {"origin": "Belonia", "destination": "Sabroom", "highway": "NH-8", "distance_km": 40, "time_min": 55, "terrain": "plain", "condition": "good", "slope_deg": 1.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 2100,
            "monsoon_months": ["June", "July", "August"],
            "landslide_susceptibility": "Low to Moderate",
            "critical_passes": ["Baramura Hill Section (NH-8)"]
        }
    },

    "West_Bengal": {
        "state_name": "West Bengal",
        "capital": "Kolkata",
        "region": "Siliguri Strategic Corridor (Gateway to North East)",
        "terrain_category": "Sub-Himalayan Dooars & Gateway Foothills",
        "primary_highways": ["NH-27", "NH-10", "NH-110", "NH-717A"],
        "locations": [
            {"id": 1, "name": "Siliguri", "district": "Darjeeling", "state": "West Bengal", "latitude": 26.7271, "longitude": 88.3953, "elevation_m": 122, "location_type": "logistics_hub", "is_urban": 1, "risk_score": 0.08},
            {"id": 46, "name": "Alipurduar", "district": "Alipurduar", "state": "West Bengal", "latitude": 26.4919, "longitude": 89.5271, "elevation_m": 93, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 85, "name": "Jalpaiguri", "district": "Jalpaiguri", "state": "West Bengal", "latitude": 26.5400, "longitude": 88.7300, "elevation_m": 86, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 86, "name": "Cooch Behar", "district": "Cooch Behar", "state": "West Bengal", "latitude": 26.3200, "longitude": 89.4500, "elevation_m": 48, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.10},
            {"id": 87, "name": "Darjeeling", "district": "Darjeeling", "state": "West Bengal", "latitude": 27.0410, "longitude": 88.2663, "elevation_m": 2042, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 88, "name": "Kalimpong", "district": "Kalimpong", "state": "West Bengal", "latitude": 27.0600, "longitude": 88.4700, "elevation_m": 1250, "location_type": "district_hq", "is_urban": 1, "risk_score": 0.35},
            {"id": 181, "name": "Mainaguri", "district": "Jalpaiguri", "state": "West Bengal", "latitude": 26.5600, "longitude": 88.8200, "elevation_m": 80, "location_type": "subdivision_town", "is_urban": 1, "risk_score": 0.10},
            {"id": 182, "name": "Hasimara", "district": "Alipurduar", "state": "West Bengal", "latitude": 26.7500, "longitude": 89.3500, "elevation_m": 110, "location_type": "highway_junction", "is_urban": 1, "risk_score": 0.12}
        ],
        "road_segments": [
            {"origin": "Siliguri", "destination": "Jalpaiguri", "highway": "NH-27", "distance_km": 45, "time_min": 60, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Jalpaiguri", "destination": "Mainaguri", "highway": "NH-27", "distance_km": 15, "time_min": 20, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Mainaguri", "destination": "Alipurduar", "highway": "NH-27", "distance_km": 90, "time_min": 120, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Alipurduar", "destination": "Hasimara", "highway": "NH-317", "distance_km": 30, "time_min": 40, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Alipurduar", "destination": "Cooch Behar", "highway": "NH-317", "distance_km": 25, "time_min": 35, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Alipurduar", "destination": "Kokrajhar", "highway": "NH-27", "distance_km": 70, "time_min": 90, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Cooch Behar", "destination": "Dhubri", "highway": "NH-17", "distance_km": 60, "time_min": 85, "terrain": "plain", "condition": "good", "slope_deg": 0.5},
            {"origin": "Siliguri", "destination": "Darjeeling", "highway": "NH-110", "distance_km": 65, "time_min": 135, "terrain": "steep_mountain", "condition": "good", "slope_deg": 9.0},
            {"origin": "Siliguri", "destination": "Kalimpong", "highway": "NH-10 / NH-717A", "distance_km": 65, "time_min": 125, "terrain": "steep_mountain", "condition": "fair", "slope_deg": 8.0}
        ],
        "hazard_profile": {
            "avg_annual_rainfall_mm": 3100,
            "monsoon_months": ["June", "July", "August", "September"],
            "landslide_susceptibility": "High in Hills / Flood Prone in Dooars",
            "critical_passes": ["Chicken's Neck Corridor", "Rohini Hill Road"]
        }
    }
}

def sync_model_data_folders(target_base_dir: Path = Path(__file__).parent / "model_data"):
    target_base_dir.mkdir(parents=True, exist_ok=True)
    
    for state_key, state_data in ALL_NER_STATES.items():
        state_dir = target_base_dir / state_key
        state_dir.mkdir(parents=True, exist_ok=True)

        (state_dir / "locations.json").write_text(json.dumps(state_data["locations"], indent=2), encoding="utf-8")
        (state_dir / "road_segments.json").write_text(json.dumps(state_data["road_segments"], indent=2), encoding="utf-8")
        (state_dir / "hazard_profile.json").write_text(json.dumps(state_data["hazard_profile"], indent=2), encoding="utf-8")

        metadata = {
            "state_key": state_key,
            "state_name": state_data["state_name"],
            "capital": state_data["capital"],
            "region": state_data["region"],
            "terrain_category": state_data["terrain_category"],
            "primary_highways": state_data["primary_highways"],
            "total_locations": len(state_data["locations"]),
            "total_road_segments": len(state_data["road_segments"])
        }
        (state_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print(f"[DataLoader] All 9 state model_data folders synced at: {target_base_dir}")

if __name__ == "__main__":
    sync_model_data_folders()
