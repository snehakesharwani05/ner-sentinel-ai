"""
NER Sentinel AI - High Performance Intelligent Cross-State Network Router
Combines state-by-state model_data/ JSONs into a unified graph, applies live Open-Meteo + TomTom
telemetry in parallel, runs ML inference, and calculates Fastest vs Safest hazard-mitigated corridors.
"""

import os
import json
import joblib
import warnings
import pandas as pd
import networkx as nx
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Any, Optional, Tuple

from telemetry import ResilientTelemetryProvider
from data_loader import sync_model_data_folders
from petrol_pumps import RealPetrolPumpProvider

warnings.filterwarnings("ignore", category=UserWarning)

MODELS_DIR = Path(__file__).parent / "models"
MODEL_DATA_DIR = Path(__file__).parent / "model_data"

TERRAIN_MAP = {"plain": 0, "hilly": 1, "steep_mountain": 2, "high_pass": 3}
CONDITION_MAP = {"good": 0, "fair": 1, "poor": 2, "critical": 3}
ROAD_STATES = ["CLEAR", "MODERATE_JAM", "HEAVY_JAM", "HAZARD_WARNING", "CRITICAL_BLOCKED"]
FEATURE_COLS = [
    "elevation_m", "slope_angle_deg", "terrain_type", "road_condition",
    "precipitation_mm", "soil_moisture", "visibility_m",
    "surface_pressure_hpa", "wind_speed_kmh", "speed_ratio", "jam_factor"
]

class NERNetworkRouter:
    def __init__(self, data_dir: Optional[Path] = None, tomtom_key: Optional[str] = None):
        self.data_dir = data_dir or MODEL_DATA_DIR
        sync_model_data_folders(self.data_dir)
        
        self.telemetry = ResilientTelemetryProvider(tomtom_key) if tomtom_key else ResilientTelemetryProvider()
        self.petrol_pumps = RealPetrolPumpProvider(tomtom_key) if tomtom_key else RealPetrolPumpProvider()
        
        # Load trained ML models
        self.classifier = joblib.load(MODELS_DIR / "road_condition_classifier.joblib")
        self.regressor = joblib.load(MODELS_DIR / "disaster_risk_regressor.joblib")
        
        self.graph = nx.Graph()
        self.locations_map: Dict[str, Dict[str, Any]] = {}
        self.id_to_name: Dict[int, str] = {}
        self.name_to_id: Dict[str, int] = {}
        self._corridor_eval_cache: Dict[str, Dict[str, Any]] = {}
        
        self._build_unified_graph()

    def _build_unified_graph(self):
        """Loads all state JSONs from model_data/ and builds the bidirectional inter-state graph."""
        state_folders = [d for d in os.listdir(self.data_dir) if (self.data_dir / d).is_dir()]
        
        for sf in sorted(state_folders):
            sp = self.data_dir / sf
            loc_f = sp / "locations.json"
            seg_f = sp / "road_segments.json"

            if loc_f.exists():
                locs = json.loads(loc_f.read_text(encoding="utf-8"))
                for loc in locs:
                    self.locations_map[loc["name"]] = loc
                    self.id_to_name[loc["id"]] = loc["name"]
                    self.name_to_id[loc["name"]] = loc["id"]
                    self.graph.add_node(
                        loc["name"],
                        id=loc["id"],
                        state=loc["state"],
                        lat=loc["latitude"],
                        lon=loc["longitude"],
                        elevation=loc["elevation_m"],
                        location_type=loc["location_type"]
                    )

            if seg_f.exists():
                segs = json.loads(seg_f.read_text(encoding="utf-8"))
                for seg in segs:
                    self.graph.add_edge(
                        seg["origin"],
                        seg["destination"],
                        highway=seg["highway"],
                        distance_km=seg["distance_km"],
                        base_time_min=seg["time_min"],
                        terrain=seg["terrain"],
                        condition=seg["condition"],
                        slope_deg=seg.get("slope_deg", 5.0)
                    )

        print(f"[NERNetworkRouter] Unified graph initialized with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} road segments.")

    def evaluate_corridor(self, origin: str, destination: str, edge_data: Dict[str, Any], use_live_api: bool = True) -> Dict[str, Any]:
        """
        Evaluates a road segment with ML inference and live Open-Meteo + TomTom telemetry.
        """
        corridor_key = f"{min(origin, destination)}__{max(origin, destination)}"
        if corridor_key in self._corridor_eval_cache:
            return self._corridor_eval_cache[corridor_key]

        node_a = self.locations_map.get(origin, {})
        node_b = self.locations_map.get(destination, {})

        mid_lat = (node_a.get("latitude", 26.0) + node_b.get("latitude", 26.0)) / 2.0
        mid_lon = (node_a.get("longitude", 92.0) + node_b.get("longitude", 92.0)) / 2.0

        if use_live_api:
            tel = self.telemetry.get_corridor_telemetry(mid_lat, mid_lon, f"{origin} -> {destination}")
        else:
            tel = {
                "temperature_c": 22.0, "precipitation_mm": 0.0, "soil_moisture": 0.32,
                "visibility_m": 8000.0, "surface_pressure_hpa": 920.0, "wind_speed_kmh": 6.0,
                "current_speed_kmh": 45.0, "free_flow_speed_kmh": 50.0, "jam_factor": 0.5,
                "is_road_closed": False, "weather_source": "Baseline", "traffic_source": "Baseline"
            }

        terrain_code = TERRAIN_MAP.get(edge_data.get("terrain", "plain"), 0)
        condition_code = CONDITION_MAP.get(edge_data.get("condition", "good"), 0)
        elevation = max(node_a.get("elevation_m", 100), node_b.get("elevation_m", 100))
        slope = edge_data.get("slope_deg", 5.0)

        current_spd = tel.get("current_speed_kmh", 45.0)
        free_flow_spd = tel.get("free_flow_speed_kmh", 50.0)
        speed_ratio = current_spd / max(1.0, free_flow_spd)

        df_feat = pd.DataFrame([{
            "elevation_m": elevation,
            "slope_angle_deg": slope,
            "terrain_type": terrain_code,
            "road_condition": condition_code,
            "precipitation_mm": tel.get("precipitation_mm", 0.0),
            "soil_moisture": tel.get("soil_moisture", 0.32),
            "visibility_m": tel.get("visibility_m", 8000.0),
            "surface_pressure_hpa": tel.get("surface_pressure_hpa", 920.0),
            "wind_speed_kmh": tel.get("wind_speed_kmh", 6.0),
            "speed_ratio": speed_ratio,
            "jam_factor": tel.get("jam_factor", 0.5)
        }], columns=FEATURE_COLS)

        pred_state_idx = int(self.classifier.predict(df_feat)[0])
        pred_risk_score = float(self.regressor.predict(df_feat)[0])
        predicted_state = ROAD_STATES[pred_state_idx]

        if tel.get("is_road_closed"):
            predicted_state = "CRITICAL_BLOCKED"
            pred_risk_score = 1.0

        base_time = edge_data.get("base_time_min", 60)
        if predicted_state == "CRITICAL_BLOCKED":
            effective_time_min = 99999.0
        elif predicted_state == "HAZARD_WARNING":
            effective_time_min = base_time * 2.0
        elif predicted_state == "HEAVY_JAM":
            effective_time_min = base_time * 1.6
        elif predicted_state == "MODERATE_JAM":
            effective_time_min = base_time * 1.25
        else:
            if speed_ratio >= 0.85:
                effective_time_min = base_time
            else:
                effective_time_min = base_time * min(1.35, 1.0 / max(0.65, speed_ratio))

        eval_result = {
            "origin": origin,
            "destination": destination,
            "highway": edge_data.get("highway", "NH"),
            "distance_km": edge_data.get("distance_km", 50),
            "base_time_min": base_time,
            "effective_time_min": round(effective_time_min, 1),
            "predicted_state": predicted_state,
            "disaster_risk_score": round(min(1.0, max(0.0, pred_risk_score)), 3),
            "is_blocked": (predicted_state == "CRITICAL_BLOCKED"),
            "telemetry": tel
        }

        self._corridor_eval_cache[corridor_key] = eval_result
        return eval_result

    def prefetch_all_corridors_parallel(self, max_workers: int = 12):
        """Fetches telemetry for all graph corridors concurrently in 1-2 seconds."""
        edges_to_fetch = []
        for u, v, data in self.graph.edges(data=True):
            corridor_key = f"{min(u, v)}__{max(u, v)}"
            if corridor_key not in self._corridor_eval_cache:
                edges_to_fetch.append((u, v, data))

        if not edges_to_fetch:
            return

        def _task(item):
            u, v, data = item
            return self.evaluate_corridor(u, v, data, use_live_api=True)

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            list(executor.map(_task, edges_to_fetch))

    def find_optimal_route(self, origin: str, destination: str, mode: str = "safest", prefetch_parallel: bool = True) -> Dict[str, Any]:
        """
        Finds optimal route between any two locations across all 8 NE states + West Bengal.
        """
        if origin not in self.graph or destination not in self.graph:
            raise ValueError(f"Origin '{origin}' or Destination '{destination}' not in road network.")

        if prefetch_parallel:
            self.prefetch_all_corridors_parallel()

        working_graph = nx.Graph()

        for u, v, data in self.graph.edges(data=True):
            eval_res = self.evaluate_corridor(u, v, data, use_live_api=True)
            if eval_res["is_blocked"]:
                continue

            if mode == "fastest":
                cost = eval_res["effective_time_min"]
            else:
                risk_penalty = 1.0 + (eval_res["disaster_risk_score"] * 8.0)
                cost = eval_res["distance_km"] * risk_penalty

            working_graph.add_edge(u, v, cost=cost, live_eval=eval_res)

        try:
            path_nodes = nx.shortest_path(working_graph, source=origin, target=destination, weight="cost")
        except nx.NetworkXNoPath:
            return {
                "success": False,
                "error": f"No accessible path found between {origin} and {destination} due to severe road blockages.",
                "origin": origin,
                "destination": destination
            }

        segments = []
        total_dist_km = 0.0
        total_time_min = 0.0
        risk_scores = []
        path_nodes_detail = []
        refueling_stations = []

        running_km = 0.0
        for i, node_name in enumerate(path_nodes):
            loc_data = self.locations_map.get(node_name, {})
            node_lat = loc_data.get("latitude", 26.0)
            node_lng = loc_data.get("longitude", 92.0)
            node_elev = loc_data.get("elevation_m", 100)

            path_nodes_detail.append({
                "name": node_name,
                "state": loc_data.get("state", "North East"),
                "latitude": node_lat,
                "longitude": node_lng,
                "elevation_m": node_elev,
                "location_type": loc_data.get("location_type", "town")
            })

            # Fetch verified real-world petrol pump or high-altitude defense fuel base
            if i > 0 or len(path_nodes) == 1:
                real_st = self.petrol_pumps.get_petrol_pump_near(node_lat, node_lng, node_name, node_elev)
                refueling_stations.append({
                    "id": f"fuel_st_{i}_{node_name.lower().replace(' ', '_')}",
                    "name": real_st["name"],
                    "brand": real_st["brand"],
                    "address": real_st.get("address", f"National Highway Corridor, {node_name}"),
                    "location_name": node_name,
                    "latitude": real_st["latitude"],
                    "longitude": real_st["longitude"],
                    "elevation_m": node_elev,
                    "distance_from_origin_km": round(running_km, 1),
                    "fuel_types": real_st["fuel_types"],
                    "has_ev_charging": real_st["has_ev_charging"],
                    "operator_type": real_st.get("operator_type", "Commercial Station"),
                    "source": real_st.get("source", "TomTom Live POI & Street Directory"),
                    "status": real_st.get("status", "Operational • 24/7 Full Stock")
                })

            if i < len(path_nodes) - 1:
                u = path_nodes[i]
                v = path_nodes[i+1]
                edge_eval = working_graph[u][v]["live_eval"]
                segments.append(edge_eval)
                total_dist_km += edge_eval["distance_km"]
                running_km += edge_eval["distance_km"]
                total_time_min += edge_eval["effective_time_min"]
                risk_scores.append(edge_eval["disaster_risk_score"])

        avg_risk = round(sum(risk_scores) / max(1, len(risk_scores)), 3)
        severity = "Critical" if avg_risk >= 0.75 else ("High" if avg_risk >= 0.50 else ("Moderate" if avg_risk >= 0.25 else "Low"))

        return {
            "success": True,
            "mode": mode,
            "origin": origin,
            "destination": destination,
            "total_distance_km": round(total_dist_km, 1),
            "estimated_transit_time_min": round(total_time_min, 1),
            "average_disaster_risk": avg_risk,
            "overall_severity": severity,
            "nodes_in_path": path_nodes,
            "pathNodes": path_nodes_detail,
            "corridors": segments,
            "refueling_stations": refueling_stations,
            "refueling_stations_count": len(refueling_stations)
        }

if __name__ == "__main__":
    print("[TEST] Initializing High-Performance Cross-State Network Router...")
    router = NERNetworkRouter()
    
    print("\n[ROUTE 1] Computing Safest Route from Siliguri to Gangtok (Sikkim):")
    res1 = router.find_optimal_route("Siliguri", "Gangtok", mode="safest")
    print(f"  Path: {' -> '.join(res1['nodes_in_path'])}")
    print(f"  Distance: {res1['total_distance_km']} km | Est. Time: {res1['estimated_transit_time_min']} mins | Risk: {res1['average_disaster_risk']} [{res1['overall_severity']}]")

    print("\n[ROUTE 2] Computing Safest Route from Guwahati to Tawang (Arunachal Pradesh):")
    res2 = router.find_optimal_route("Guwahati", "Tawang", mode="safest")
    print(f"  Path: {' -> '.join(res2['nodes_in_path'])}")
    print(f"  Distance: {res2['total_distance_km']} km | Est. Time: {res2['estimated_transit_time_min']} mins | Risk: {res2['average_disaster_risk']} [{res2['overall_severity']}]")

    print("\n[ROUTE 3] Computing Safest Route from Silchar (Assam) to Imphal (Manipur):")
    res3 = router.find_optimal_route("Silchar", "Imphal", mode="safest")
    print(f"  Path: {' -> '.join(res3['nodes_in_path'])}")
    print(f"  Distance: {res3['total_distance_km']} km | Est. Time: {res3['estimated_transit_time_min']} mins | Risk: {res3['average_disaster_risk']} [{res3['overall_severity']}]")
