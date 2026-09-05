"""
Autonomous Offline GIS Routing & Multi-State Graph Stitching Architecture Generator
Builds Tier 1 Regional Backbone Graph and Tier 2 State Dense Subgraphs
for PurvaSetu / PRAGATI-AI (SIH Problem Statement 26002).
"""

import os
import json
import math
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DATA_DIR = BASE_DIR / "ai-engine" / "model_data"
PUBLIC_DATA_DIR = BASE_DIR / "frontend" / "public" / "data"
SRC_OFFLINE_DIR = BASE_DIR / "frontend" / "src" / "data" / "offline"

PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
SRC_OFFLINE_DIR.mkdir(parents=True, exist_ok=True)

# 1. BORDER GATEWAY REGISTRY
BORDER_GATEWAY_REGISTRY = {
    "Jorabat": {
        "id": "gw_jorabat",
        "name": "Jorabat Border Gateway",
        "states": ["Assam", "Meghalaya"],
        "lat": 26.1158,
        "lng": 91.8700,
        "highway": "NH-6",
        "description": "Primary Guwahati-Shillong corridor transit checkpoint"
    },
    "Vairengte": {
        "id": "gw_vairengte",
        "name": "Vairengte Border Checkpoint",
        "states": ["Assam", "Mizoram"],
        "lat": 24.3120,
        "lng": 92.7610,
        "highway": "NH-306",
        "description": "Sole strategic highway artery connecting Barak Valley to Aizawl"
    },
    "Churaibari": {
        "id": "gw_churaibari",
        "name": "Churaibari Integrated Checkpost",
        "states": ["Assam", "Tripura"],
        "lat": 24.5360,
        "lng": 92.2470,
        "highway": "NH-8",
        "description": "Lifeline gateway connecting Karimganj/Assam with North Tripura/Agartala"
    },
    "Mao": {
        "id": "gw_mao",
        "name": "Mao Gate Transit Checkpoint",
        "states": ["Nagaland", "Manipur"],
        "lat": 25.5080,
        "lng": 94.1350,
        "highway": "NH-2",
        "description": "High-altitude mountain pass gateway connecting Kohima to Senapati/Imphal"
    },
    "Srirampur": {
        "id": "gw_srirampur",
        "name": "Srirampur Border Gateway (Chicken's Neck)",
        "states": ["Assam", "West Bengal"],
        "lat": 26.4710,
        "lng": 89.9120,
        "highway": "NH-27 / AH-48",
        "description": "Primary multi-lane East-West corridor connecting North East with mainland India"
    },
    "Bhalukpong": {
        "id": "gw_bhalukpong",
        "name": "Bhalukpong Inner Line Checkgate",
        "states": ["Assam", "Arunachal Pradesh"],
        "lat": 27.0120,
        "lng": 92.6510,
        "highway": "NH-13 / Trans-Arunachal Highway",
        "description": "Gateway to West Kameng, Bomdila, Dirang, and Tawang alpine sector"
    },
    "Bandardewa": {
        "id": "gw_bandardewa",
        "name": "Bandardewa Capital Gateway",
        "states": ["Assam", "Arunachal Pradesh"],
        "lat": 27.1260,
        "lng": 93.8120,
        "highway": "NH-415",
        "description": "Direct arterial entrance from Harmuti/Lakhimpur to Itanagar Capital Complex"
    },
    "Dimapur": {
        "id": "gw_dimapur",
        "name": "Dimapur Commercial Border Gateway",
        "states": ["Assam", "Nagaland"],
        "lat": 25.9090,
        "lng": 93.7266,
        "highway": "NH-29 / Asian Highway 1",
        "description": "Major railhead and logistics transshipment gateway into Nagaland and Manipur"
    },
    "Rangpo": {
        "id": "gw_rangpo",
        "name": "Rangpo Border Checkpost",
        "states": ["West Bengal", "Sikkim"],
        "lat": 27.1770,
        "lng": 88.5300,
        "highway": "NH-10",
        "description": "Teesta River gorge gateway connecting Siliguri/Kalimpong with East Sikkim/Gangtok"
    },
    "Jiribam": {
        "id": "gw_jiribam",
        "name": "Jiribam Western Border Gateway",
        "states": ["Assam", "Manipur"],
        "lat": 24.8020,
        "lng": 93.1250,
        "highway": "NH-37",
        "description": "Strategic alternative highway connection from Silchar to Western Manipur"
    },
    "Ruksin": {
        "id": "gw_ruksin",
        "name": "Ruksin Border Checkpoint",
        "states": ["Assam", "Arunachal Pradesh"],
        "lat": 27.8380,
        "lng": 95.3120,
        "highway": "NH-515",
        "description": "Arterial gateway from Jonai/Dhemaji to Pasighat/Siang Valley"
    }
}

# 2. DOUGLAS-PEUCKER COORDINATE SIMPLIFICATION
def perpendicular_distance(point, start, end):
    lat, lng = point
    lat1, lng1 = start
    lat2, lng2 = end
    
    if lat1 == lat2 and lng1 == lng2:
        return math.hypot(lat - lat1, lng - lng1)
    
    # Area of triangle / base length
    num = abs((lng2 - lng1) * lat - (lat2 - lat1) * lng + lat2 * lng1 - lng2 * lat1)
    den = math.hypot(lat2 - lat1, lng2 - lng1)
    return num / den

def douglas_peucker(coords, epsilon=0.0001):
    """Simplifies polyline coordinates while preserving critical topological turns."""
    if len(coords) <= 2:
        return coords
    
    dmax = 0.0
    index = 0
    start = coords[0]
    end = coords[-1]
    
    for i in range(1, len(coords) - 1):
        d = perpendicular_distance(coords[i], start, end)
        if d > dmax:
            index = i
            dmax = d
            
    if dmax > epsilon:
        rec_results1 = douglas_peucker(coords[:index + 1], epsilon)
        rec_results2 = douglas_peucker(coords[index:], epsilon)
        return rec_results1[:-1] + rec_results2
    else:
        return [coords[0], coords[-1]]

def to_radians(degrees):
    return (degrees * math.pi) / 180.0

def haversine_distance_km(lat1, lon1, lat2, lon2):
    dLat = to_radians(lat2 - lat1)
    dLon = to_radians(lon2 - lon1)
    a = math.sin(dLat / 2.0) ** 2 + math.cos(to_radians(lat1)) * math.cos(to_radians(lat2)) * math.sin(dLon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return 6371.0 * c

def get_road_hierarchy_weight(hw: str) -> float:
    """Road Hierarchy-Aware Cost Metrics to prioritize National/Asian Highways over rural shortcuts."""
    hw_upper = str(hw).upper()
    if "AH" in hw_upper or "EXPRESSWAY" in hw_upper or "NH" in hw_upper:
        return 0.85
    elif "SH" in hw_upper or "STATE HIGHWAY" in hw_upper:
        return 1.0
    elif "MDR" in hw_upper or "MAJOR DISTRICT" in hw_upper:
        return 1.25
    else:
        return 1.85

def get_speed_for_highway(hw: str, terrain: str) -> float:
    hw_upper = str(hw).upper()
    if "AH" in hw_upper or "EXPRESSWAY" in hw_upper:
        speed = 70.0
    elif "NH" in hw_upper:
        speed = 60.0
    elif "SH" in hw_upper or "STATE HIGHWAY" in hw_upper:
        speed = 45.0
    elif "MDR" in hw_upper:
        speed = 35.0
    else:
        speed = 30.0
        
    if terrain == "high_pass":
        speed *= 0.55
    elif terrain == "steep_mountain":
        speed *= 0.70
    elif terrain == "hilly":
        speed *= 0.85
    return max(15.0, round(speed, 1))

def calculate_calibrated_edge_costs(u_loc: dict, v_loc: dict, dist_km: float, hw: str, terrain: str, slope_deg: float, flood_risk: float, is_urban: bool):
    """
    Computes elevation gradient, tortuosity curvature, hierarchy-weighted fastest impedance,
    and hazard-mitigated safest cost.
    """
    elev_u = float(u_loc.get("elevation_m", 100))
    elev_v = float(v_loc.get("elevation_m", 100))
    delta_h = abs(elev_v - elev_u)
    
    # 1. Elevation-Informed Gradient Factor
    gradient_factor = 1.0 + (delta_h / max(500.0, dist_km * 1000.0)) * 1.8
    
    # 2. Tortuosity Curvature Penalty
    u_lat = float(u_loc.get("lat", u_loc.get("latitude", 26.0)))
    u_lng = float(u_loc.get("lng", u_loc.get("longitude", 92.0)))
    v_lat = float(v_loc.get("lat", v_loc.get("latitude", 26.0)))
    v_lng = float(v_loc.get("lng", v_loc.get("longitude", 92.0)))
    straight_dist_km = max(0.5, haversine_distance_km(u_lat, u_lng, v_lat, v_lng))
    tortuosity = min(3.5, max(1.0, dist_km / straight_dist_km))
    
    # 3. Effective Speed with Tortuosity Winding Penalty
    baseline_speed = get_speed_for_highway(hw, terrain)
    effective_speed = baseline_speed / max(1.0, tortuosity * 0.85)
    
    # 4. Road Hierarchy Weight
    hierarchy_weight = get_road_hierarchy_weight(hw)
    
    # 5. Fastest Cost (Impedance minutes)
    fastest_time_min = round((dist_km / max(10.0, effective_speed)) * 60.0 * hierarchy_weight * gradient_factor, 1)
    
    # 6. Safest Resilient Cost
    terrain_weight = 0.8 if terrain == "high_pass" else (0.45 if terrain == "steep_mountain" else (0.2 if terrain == "hilly" else 0.0))
    slope_weight = min(0.6, (slope_deg / 25.0) * 0.5)
    flood_weight = flood_risk * 0.8
    urban_bonus = 0.20 if is_urban else 0.0
    
    safest_factor = 1.0 + terrain_weight + slope_weight + flood_weight - urban_bonus
    safest_cost = round((dist_km / max(10.0, effective_speed)) * 60.0 * safest_factor * gradient_factor, 1)
    
    return {
        "delta_h": delta_h,
        "gradient_factor": round(gradient_factor, 3),
        "tortuosity": round(tortuosity, 3),
        "effective_speed_kmh": round(effective_speed, 1),
        "hierarchy_weight": hierarchy_weight,
        "fastest_time_min": fastest_time_min,
        "safest_cost": safest_cost
    }

def build_offline_graphs():
    state_folders = [d for d in os.listdir(MODEL_DATA_DIR) if (MODEL_DATA_DIR / d).is_dir()]
    
    all_locations = {}
    all_segments = []
    state_dense_graphs = {}
    
    # Process each state
    for sf in sorted(state_folders):
        sp = MODEL_DATA_DIR / sf
        loc_f = sp / "locations.json"
        seg_f = sp / "road_segments.json"
        
        state_name = sf.replace("_", " ")
        state_key = sf.lower()
        
        locs = json.loads(loc_f.read_text(encoding="utf-8")) if loc_f.exists() else []
        segs = json.loads(seg_f.read_text(encoding="utf-8")) if seg_f.exists() else []
        
        processed_locs = []
        for loc in locs:
            lat = round(float(loc["latitude"]), 6)
            lng = round(float(loc["longitude"]), 6)
            if not (20.0 <= lat <= 30.0 and 88.0 <= lng <= 98.0):
                continue
            loc_entry = {
                "id": loc["id"],
                "name": loc["name"],
                "state": loc.get("state", state_name),
                "district": loc.get("district", ""),
                "latitude": lat,
                "longitude": lng,
                "lat": lat,
                "lng": lng,
                "elevation_m": loc.get("elevation_m", 100),
                "location_type": loc.get("location_type", "town"),
                "is_urban": loc.get("is_urban", 0),
                "risk_score": loc.get("risk_score", 0.1)
            }
            all_locations[loc["name"]] = loc_entry
            processed_locs.append(loc_entry)
            
        processed_segs = []
        for seg in segs:
            u = seg["origin"]
            v = seg["destination"]
            dist = float(seg["distance_km"])
            hw = seg.get("highway", "NH")
            terrain = seg.get("terrain", "plain")
            slope = float(seg.get("slope_deg", 5.0))
            cond = seg.get("condition", "good")
            flood_risk = 0.35 if ("flood" in cond or terrain == "plain" and "river" in hw.lower()) else 0.1
            
            # Check urban
            u_loc = all_locations.get(u, {})
            v_loc = all_locations.get(v, {})
            is_urban = bool(u_loc.get("is_urban") or v_loc.get("is_urban") or u_loc.get("location_type") in ('state_capital', 'district_hq', 'logistics_hub') or v_loc.get("location_type") in ('state_capital', 'district_hq', 'logistics_hub'))
            
            costs = calculate_calibrated_edge_costs(u_loc, v_loc, dist, hw, terrain, slope, flood_risk, is_urban)
            
            # Polyline coordinates with Douglas-Peucker simplification
            raw_coords = [[u_loc.get("lat", 26.0), u_loc.get("lng", 92.0)], [v_loc.get("lat", 26.0), v_loc.get("lng", 92.0)]]
            clean_coords = douglas_peucker(raw_coords, epsilon=0.0001)
            
            seg_entry = {
                "u": u,
                "v": v,
                "origin": u,
                "destination": v,
                "distance_km": dist,
                "highway": hw,
                "terrain": terrain,
                "slope_deg": slope,
                "condition": cond,
                "speed_kmh": costs["effective_speed_kmh"],
                "delta_h": costs["delta_h"],
                "gradient_factor": costs["gradient_factor"],
                "tortuosity": costs["tortuosity"],
                "hierarchy_weight": costs["hierarchy_weight"],
                "fastest_time_min": costs["fastest_time_min"],
                "safest_cost": costs["safest_cost"],
                "is_urban": is_urban,
                "coordinates": clean_coords
            }
            processed_segs.append(seg_entry)
            all_segments.append(seg_entry)
            
        # Save Tier 2 State Dense Subgraph
        state_dense_graphs[state_key] = {
            "state": state_name,
            "state_key": state_key,
            "node_count": len(processed_locs),
            "edge_count": len(processed_segs),
            "nodes": processed_locs,
            "edges": processed_segs
        }
        
        # Write state JSON to public/data and src/data/offline
        (PUBLIC_DATA_DIR / f"{state_key}_dense.json").write_text(json.dumps(state_dense_graphs[state_key], indent=2), encoding="utf-8")
        
    # 3. INTER-STATE BOUNDARY STITCHING: Add Bridge Edges
    bridge_edges = [
        # Assam <-> Meghalaya (Jorabat)
        {"u": "Guwahati", "v": "Shillong", "distance_km": 99.0, "highway": "NH-6 / AH-1", "terrain": "hilly", "slope_deg": 6.0, "condition": "good", "gateway": "Jorabat"},
        {"u": "Guwahati", "v": "Nongpoh", "distance_km": 50.0, "highway": "NH-6", "terrain": "hilly", "slope_deg": 5.0, "condition": "good", "gateway": "Jorabat"},
        
        # Assam <-> Mizoram (Vairengte)
        {"u": "Silchar", "v": "Aizawl", "distance_km": 175.0, "highway": "NH-306", "terrain": "hilly", "slope_deg": 8.0, "condition": "fair", "gateway": "Vairengte"},
        {"u": "Silchar", "v": "Kolasib", "distance_km": 95.0, "highway": "NH-306", "terrain": "hilly", "slope_deg": 7.0, "condition": "good", "gateway": "Vairengte"},
        
        # Assam <-> Tripura (Churaibari)
        {"u": "Karimganj", "v": "Dharmanagar", "distance_km": 68.0, "highway": "NH-8", "terrain": "plain", "slope_deg": 3.0, "condition": "good", "gateway": "Churaibari"},
        {"u": "Karimganj", "v": "Agartala", "distance_km": 195.0, "highway": "NH-8", "terrain": "plain", "slope_deg": 3.0, "condition": "good", "gateway": "Churaibari"},
        
        # Nagaland <-> Manipur (Mao Gate)
        {"u": "Kohima", "v": "Imphal", "distance_km": 138.0, "highway": "NH-2", "terrain": "steep_mountain", "slope_deg": 10.0, "condition": "fair", "gateway": "Mao"},
        {"u": "Kohima", "v": "Senapati", "distance_km": 65.0, "highway": "NH-2", "terrain": "steep_mountain", "slope_deg": 9.0, "condition": "fair", "gateway": "Mao"},
        
        # Assam <-> West Bengal (Srirampur - Siliguri Gateway)
        {"u": "Dhubri", "v": "Siliguri", "distance_km": 215.0, "highway": "NH-27", "terrain": "plain", "slope_deg": 2.0, "condition": "good", "gateway": "Srirampur"},
        {"u": "Bongaigaon", "v": "Alipurduar", "distance_km": 110.0, "highway": "NH-27 / AH-48", "terrain": "plain", "slope_deg": 2.0, "condition": "good", "gateway": "Srirampur"},
        {"u": "Bongaigaon", "v": "Siliguri", "distance_km": 240.0, "highway": "NH-27 / AH-48", "terrain": "plain", "slope_deg": 2.0, "condition": "good", "gateway": "Srirampur"},
        
        # Assam <-> Arunachal Pradesh (Bhalukpong & Bandardewa & Ruksin)
        {"u": "Tezpur", "v": "Bomdila", "distance_km": 155.0, "highway": "NH-13", "terrain": "steep_mountain", "slope_deg": 12.0, "condition": "fair", "gateway": "Bhalukpong"},
        {"u": "North Lakhimpur", "v": "Itanagar", "distance_km": 60.0, "highway": "NH-415", "terrain": "hilly", "slope_deg": 6.0, "condition": "good", "gateway": "Bandardewa"},
        {"u": "Dhemaji", "v": "Pasighat", "distance_km": 68.0, "highway": "NH-515", "terrain": "plain", "slope_deg": 3.0, "condition": "good", "gateway": "Ruksin"},
        
        # Assam <-> Nagaland (Dimapur Gateway)
        {"u": "Nagaon", "v": "Dimapur", "distance_km": 165.0, "highway": "NH-29", "terrain": "plain", "slope_deg": 3.0, "condition": "good", "gateway": "Dimapur"},
        {"u": "Golaghat", "v": "Dimapur", "distance_km": 80.0, "highway": "NH-129", "terrain": "plain", "slope_deg": 2.0, "condition": "good", "gateway": "Dimapur"},
        
        # West Bengal <-> Sikkim (Rangpo / Sevoke Gateway)
        {"u": "Siliguri", "v": "Gangtok", "distance_km": 115.0, "highway": "NH-10", "terrain": "steep_mountain", "slope_deg": 11.0, "condition": "fair", "gateway": "Rangpo"},
        {"u": "Siliguri", "v": "Namchi", "distance_km": 95.0, "highway": "NH-10 / SH", "terrain": "steep_mountain", "slope_deg": 10.0, "condition": "fair", "gateway": "Rangpo"},
        
        # Assam <-> Manipur (Jiribam Western Gateway)
        {"u": "Silchar", "v": "Imphal", "distance_km": 255.0, "highway": "NH-37", "terrain": "steep_mountain", "slope_deg": 9.0, "condition": "fair", "gateway": "Jiribam"}
    ]
    
    stitched_bridge_segments = []
    for b in bridge_edges:
        u, v = b["u"], b["v"]
        dist = b["distance_km"]
        hw = b["highway"]
        terrain = b["terrain"]
        slope = b["slope_deg"]
        cond = b["condition"]
        gw = b["gateway"]
        
        u_loc = all_locations.get(u, {})
        v_loc = all_locations.get(v, {})
        
        costs = calculate_calibrated_edge_costs(u_loc, v_loc, dist, hw, terrain, slope, 0.15, True)
        
        raw_coords = [[u_loc.get("lat", 26.0), u_loc.get("lng", 92.0)], [v_loc.get("lat", 26.0), v_loc.get("lng", 92.0)]]
        clean_coords = douglas_peucker(raw_coords, epsilon=0.0001)
        
        bridge_entry = {
            "u": u,
            "v": v,
            "origin": u,
            "destination": v,
            "distance_km": dist,
            "highway": hw,
            "terrain": terrain,
            "slope_deg": slope,
            "condition": cond,
            "speed_kmh": costs["effective_speed_kmh"],
            "delta_h": costs["delta_h"],
            "gradient_factor": costs["gradient_factor"],
            "tortuosity": costs["tortuosity"],
            "hierarchy_weight": costs["hierarchy_weight"],
            "fastest_time_min": costs["fastest_time_min"],
            "safest_cost": costs["safest_cost"],
            "is_urban": True,
            "is_inter_state_bridge": True,
            "gateway": gw,
            "coordinates": clean_coords
        }
        stitched_bridge_segments.append(bridge_entry)
        all_segments.append(bridge_entry)
        
    # 4. BUILD TIER 1 REGIONAL BACKBONE GRAPH (< 3MB)
    backbone_locations = dict(all_locations)
            
    # Filter backbone edges
    backbone_segments = list(all_segments)
            
    # Add any missing border bridge edges to backbone
    for b in stitched_bridge_segments:
        if b not in backbone_segments:
            backbone_segments.append(b)
            
    backbone_graph = {
        "version": "2.0.0",
        "description": "PurvaSetu / PRAGATI-AI Tier 1 Regional Backbone Road Graph",
        "total_nodes": len(backbone_locations),
        "total_edges": len(backbone_segments),
        "gateways": BORDER_GATEWAY_REGISTRY,
        "nodes": list(backbone_locations.values()),
        "nodes_dict": backbone_locations,
        "edges": backbone_segments
    }
    
    # Save Tier 1 Regional Backbone Graph (< 3MB)
    backbone_json_path = PUBLIC_DATA_DIR / "ner_backbone_graph.json"
    backbone_json_path.write_text(json.dumps(backbone_graph, indent=2), encoding="utf-8")
    backbone_size_kb = round(len(backbone_json_path.read_bytes()) / 1024.0, 1)
    print(f"[OfflineGraphBuilder] Tier 1 Backbone Graph created: {backbone_size_kb} KB ({len(backbone_locations)} nodes, {len(backbone_segments)} edges).")
    
    # 5. BUILD STITCHED NER GRAPH (nodes: { [id]: [lat, lng] }, adj: { [id]: [{ to, dist, risk }] })
    stitched_nodes = {}
    stitched_adj = {}

    for name, loc in all_locations.items():
        stitched_nodes[name] = [loc["lat"], loc["lng"]]
        stitched_adj[name] = []

    for seg in all_segments:
        u = seg["u"]
        v = seg["v"]
        dist = seg["distance_km"]
        risk = round(0.45 if seg.get("terrain") == "high_pass" else (0.30 if seg.get("terrain") == "steep_mountain" else (0.18 if seg.get("terrain") == "hilly" else 0.08)), 3)
        hw = seg.get("highway", "NH")
        speed = seg.get("speed_kmh", 50)
        time_min = seg.get("fastest_time_min", round((dist / max(10, speed)) * 60, 1))

        edge_data_forward = {
            "to": v,
            "dist": dist,
            "risk": risk,
            "highway": hw,
            "speed_kmh": speed,
            "time_min": time_min,
            "fastest_cost": seg.get("fastest_time_min", time_min),
            "safest_cost": seg.get("safest_cost", time_min),
            "hierarchy_weight": seg.get("hierarchy_weight", 1.0),
            "gradient_factor": seg.get("gradient_factor", 1.0),
            "tortuosity": seg.get("tortuosity", 1.0),
            "terrain": seg.get("terrain", "plain")
        }
        edge_data_reverse = {
            "to": u,
            "dist": dist,
            "risk": risk,
            "highway": hw,
            "speed_kmh": speed,
            "time_min": time_min,
            "fastest_cost": seg.get("fastest_time_min", time_min),
            "safest_cost": seg.get("safest_cost", time_min),
            "hierarchy_weight": seg.get("hierarchy_weight", 1.0),
            "gradient_factor": seg.get("gradient_factor", 1.0),
            "tortuosity": seg.get("tortuosity", 1.0),
            "terrain": seg.get("terrain", "plain")
        }

        if u in stitched_adj:
            stitched_adj[u].append(edge_data_forward)
        if v in stitched_adj:
            stitched_adj[v].append(edge_data_reverse)

    stitched_graph = {
        "nodes": stitched_nodes,
        "adj": stitched_adj,
        "metadata": {
            "total_nodes": len(stitched_nodes),
            "total_segments": len(all_segments),
            "version": "2.0.0"
        }
    }

    stitched_json_path = PUBLIC_DATA_DIR / "stitched_ner_graph.json"
    stitched_json_path.write_text(json.dumps(stitched_graph, indent=2), encoding="utf-8")
    print(f"[OfflineGraphBuilder] Stitched NER Graph created: {round(len(stitched_json_path.read_bytes()) / 1024.0, 1)} KB.")

    # Also write a complete bundled index for zero-network instant importing
    esm_content = f"""// Auto-Generated Tier 1 Regional Backbone Graph & Border Gateway Registry
export const BORDER_GATEWAY_REGISTRY = {json.dumps(BORDER_GATEWAY_REGISTRY, indent=2)};

export const NER_BACKBONE_GRAPH = {json.dumps(backbone_graph, indent=2)};

export const STITCHED_NER_GRAPH = {json.dumps(stitched_graph, indent=2)};

export const ALL_OFFLINE_NODES = {json.dumps(all_locations, indent=2)};

export const ALL_OFFLINE_EDGES = {json.dumps(all_segments, indent=2)};

export const STATE_DENSE_MANIFEST = {json.dumps({k: {"state": v["state"], "node_count": v["node_count"], "edge_count": v["edge_count"]} for k, v in state_dense_graphs.items()}, indent=2)};
"""
    (SRC_OFFLINE_DIR / "index.js").write_text(esm_content, encoding="utf-8")
    print(f"[OfflineGraphBuilder] ESM bundle written to {SRC_OFFLINE_DIR / 'index.js'}")
    
    for k, v in state_dense_graphs.items():
        state_esm = f"export const {k.upper()}_DENSE_GRAPH = {json.dumps(v, indent=2)};\nexport default {k.upper()}_DENSE_GRAPH;\n"
        (SRC_OFFLINE_DIR / f"{k}_dense.js").write_text(state_esm, encoding="utf-8")

if __name__ == "__main__":
    build_offline_graphs()
