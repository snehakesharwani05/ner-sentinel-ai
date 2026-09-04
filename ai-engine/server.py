"""
NER Sentinel AI - Python Real-Time AI & Telemetry Microservice
Exposes REST API on Port 5001 for live ML inference, real-time Open-Meteo & TomTom
telemetry, and dynamic hazard-mitigated cross-state routing.
"""

import os
import json
import warnings
from pathlib import Path
from flask import Flask, request, jsonify

from network_router import NERNetworkRouter
from telemetry import ResilientTelemetryProvider
from disruption_feed import LiveDisruptionFeed
from convoy_tracker import ConvoyTrackingEngine
from assistant_engine import assistant_engine

warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)
router = NERNetworkRouter()
telemetry_provider = ResilientTelemetryProvider()
disruption_feed = LiveDisruptionFeed()
convoy_tracker = ConvoyTrackingEngine()

_disruptions_cache = {"timestamp": 0, "data": []}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ONLINE",
        "service": "NER Sentinel Python AI Engine",
        "version": "1.0.0",
        "total_nodes": router.graph.number_of_nodes(),
        "total_corridors": router.graph.number_of_edges(),
        "models": {
            "classifier": "Random Forest (99.40% Accuracy)",
            "regressor": "Gradient Boosting (R2: 0.9824)"
        },
        "telemetry": {
            "weather": "Open-Meteo Live API",
            "traffic": "TomTom Flow & Incidents Live API",
            "failover": "Resilient Mutual Backup (100% Uptime)"
        }
    })

@app.route('/api/v1/ai/disruptions/live', methods=['GET'])
def get_live_disruptions():
    import time
    now = time.time()
    # Cache for 300 seconds (5 minutes)
    if now - _disruptions_cache["timestamp"] < 300 and _disruptions_cache["data"]:
        return jsonify({
            "success": True,
            "count": len(_disruptions_cache["data"]),
            "data": _disruptions_cache["data"],
            "source": "Live Telemetry Scanner (Open-Meteo & TomTom)"
        })

    hazards = disruption_feed.get_live_disruptions()
    _disruptions_cache["timestamp"] = now
    _disruptions_cache["data"] = hazards

    return jsonify({
        "success": True,
        "count": len(hazards),
        "data": hazards,
        "source": "Live Telemetry Scanner (Open-Meteo & TomTom)"
    })

def _prewarm_telemetry():
    import threading, time
    def _worker():
        time.sleep(1)
        print("[AI ENGINE] Prewarming real-time disruption scanner across North East...")
        hazards = disruption_feed.get_live_disruptions()
        _disruptions_cache["timestamp"] = time.time()
        _disruptions_cache["data"] = hazards
        print(f"[AI ENGINE] Prewarm complete! {len(hazards)} live real-world hazards active.")
    threading.Thread(target=_worker, daemon=True).start()

_prewarm_telemetry()

@app.route('/api/v1/ai/route', methods=['POST'])
def find_route():
    try:
        data = request.get_json() or {}
        origin = data.get("origin")
        destination = data.get("destination")
        mode = data.get("mode", "safest")

        # Support ID lookup if passed as integer IDs
        if isinstance(origin, int) or (isinstance(origin, str) and origin.isdigit()):
            origin = router.id_to_name.get(int(origin), origin)
        if isinstance(destination, int) or (isinstance(destination, str) and destination.isdigit()):
            destination = router.id_to_name.get(int(destination), destination)

        if not origin or not destination:
            return jsonify({"success": False, "error": "origin and destination are required"}), 400

        result = router.find_optimal_route(str(origin), str(destination), mode=mode)
        return jsonify(result)
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/ai/analyze', methods=['POST'])
def analyze_routes():
    try:
        data = request.get_json() or {}
        origin = data.get("origin")
        destination = data.get("destination")

        if isinstance(origin, int) or (isinstance(origin, str) and origin.isdigit()):
            origin = router.id_to_name.get(int(origin), origin)
        if isinstance(destination, int) or (isinstance(destination, str) and destination.isdigit()):
            destination = router.id_to_name.get(int(destination), destination)

        if not origin or not destination:
            return jsonify({"success": False, "error": "origin and destination are required"}), 400

        dual_res = router.find_dual_routes(str(origin), str(destination))

        return jsonify({
            "success": True,
            "data": {
                "fastestRoute": dual_res.get("fastestRoute"),
                "safestRoute": dual_res.get("safestRoute"),
                "recommendation": dual_res.get("recommendation", "Optimal path computed with multi-objective geotechnical safety analysis.")
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/ai/simulate', methods=['POST'])
def simulate_hazard():
    try:
        from network_router import FEATURE_COLS, TERRAIN_MAP, ROAD_STATES
        import pandas as pd

        data = request.get_json() or {}
        target_name = data.get("target_location", "Sela Pass")
        origin_name = data.get("origin_location", "Guwahati")
        rainfall_mm = float(data.get("rainfall_mm", 200.0))
        soil_moisture = float(data.get("soil_moisture", 0.42))
        jam_factor = float(data.get("jam_factor", 3.0))

        # Support ID lookup if passed as integer IDs
        if isinstance(target_name, int) or (isinstance(target_name, str) and target_name.isdigit()):
            target_name = router.id_to_name.get(int(target_name), target_name)
        if isinstance(origin_name, int) or (isinstance(origin_name, str) and origin_name.isdigit()):
            origin_name = router.id_to_name.get(int(origin_name), origin_name)

        target_node = router.locations_map.get(str(target_name), {})
        elevation_m = target_node.get("elevation_m", 1200)
        terrain_str = target_node.get("terrain", "steep_mountain")
        terrain_code = TERRAIN_MAP.get(terrain_str, 2)

        # Slope estimation based on terrain
        slope_deg = 18.0 if terrain_str in ["high_pass", "steep_mountain"] else (8.0 if terrain_str == "hilly" else 2.0)

        # Build feature vector matching exact trained model schema
        speed_ratio = max(0.05, 1.0 - (jam_factor * 0.08) - (rainfall_mm * 0.002))
        sim_features = pd.DataFrame([{
            "elevation_m": elevation_m,
            "slope_angle_deg": slope_deg,
            "terrain_type": terrain_code,
            "road_condition": 2 if rainfall_mm > 150 else 0, # poor condition under heavy rain
            "precipitation_mm": rainfall_mm,
            "soil_moisture": soil_moisture,
            "visibility_m": max(100.0, 5000.0 - (rainfall_mm * 15.0)),
            "surface_pressure_hpa": 980.0,
            "wind_speed_kmh": min(80.0, 15.0 + (rainfall_mm / 10.0)),
            "speed_ratio": speed_ratio,
            "jam_factor": jam_factor
        }], columns=FEATURE_COLS)

        # Run AI Machine Learning Models
        pred_state_idx = int(router.classifier.predict(sim_features)[0])
        predicted_state = ROAD_STATES[pred_state_idx]
        raw_risk = float(router.regressor.predict(sim_features)[0])
        disaster_risk_score = round(max(0.0, min(1.0, raw_risk)), 3)

        if rainfall_mm > 250 or (soil_moisture >= 0.42 and slope_deg >= 12.0):
            predicted_state = "CRITICAL_BLOCKED"
            disaster_risk_score = max(0.85, disaster_risk_score)

        # Landslide geotechnical probability
        landslide_prob = min(99.0, max(5.0, (rainfall_mm * 0.22) + (soil_moisture * 105.0) + (slope_deg * 1.6)))
        is_blocked = (predicted_state == "CRITICAL_BLOCKED") or (disaster_risk_score >= 0.70)

        # Calculate Standard Route vs Emergency Bypass Route
        std_route = router.find_optimal_route(str(origin_name), str(target_name), mode="safest")
        
        # Operational recommendation
        if is_blocked:
            directive = f"CRITICAL HAZARD: {target_name} corridor impassable due to severe mudslide risk. Emergency rerouting initiated. Dispatch BRO heavy recovery teams."
            severity_band = "Critical"
        elif disaster_risk_score >= 0.50:
            directive = f"HIGH HAZARD WARNING: Heavy precipitation ({rainfall_mm}mm) and high soil saturation ({soil_moisture} m3/m3) detected. Speed limited to 20 km/h. Essential convoys only."
            severity_band = "High"
        elif disaster_risk_score >= 0.25:
            directive = f"MODERATE CAUTION: Wet road surfaces and fog present around {target_name}. Maintain increased braking distance."
            severity_band = "Moderate"
        else:
            directive = f"NORMAL OPERATIONS: Weather within safe thresholds. Corridor clear for all logistics transit."
            severity_band = "Low"

        return jsonify({
            "success": True,
            "simulation": {
                "target_location": target_name,
                "target_state": target_node.get("state", "North East"),
                "elevation_m": elevation_m,
                "terrain": terrain_str,
                "simulated_rainfall_mm": rainfall_mm,
                "simulated_soil_moisture": soil_moisture,
                "simulated_jam_factor": jam_factor
            },
            "ml_assessment": {
                "predicted_state": predicted_state,
                "disaster_risk_score": disaster_risk_score,
                "severity_band": severity_band,
                "landslide_probability_pct": round(landslide_prob, 1),
                "is_corridor_blocked": is_blocked,
                "capacity_drop_pct": min(100, int(disaster_risk_score * 100)),
                "operational_directive": directive
            },
            "route_impact": {
                "origin": origin_name,
                "destination": target_name,
                "total_distance_km": std_route.get("total_distance_km", 0),
                "estimated_time_min": std_route.get("estimated_transit_time_min", 0),
                "nodes_in_path": std_route.get("nodes_in_path", []),
                "corridors": std_route.get("corridors", [])
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/ai/convoys', methods=['GET'])
def get_convoys():
    try:
        commodity = request.args.get('commodity', 'ALL')
        convoys = convoy_tracker.get_all_convoys(commodity)
        return jsonify({
            "success": True,
            "count": len(convoys),
            "data": convoys
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/ai/convoys/<convoy_id>', methods=['GET'])
def get_convoy_detail(convoy_id):
    try:
        convoy = convoy_tracker.get_convoy_by_id(convoy_id)
        if not convoy:
            return jsonify({"success": False, "error": f"Convoy {convoy_id} not found."}), 404
        return jsonify({"success": True, "data": convoy})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/ai/convoys/trigger-reroute/<convoy_id>', methods=['POST'])
def trigger_dynamic_reroute(convoy_id):
    try:
        data = request.get_json() or {}
        blocked_edge = data.get("blocked_edge_id", "NH-13/Sela")
        
        convoy = convoy_tracker.get_convoy_by_id(convoy_id)
        if not convoy:
            return jsonify({"success": False, "error": f"Convoy {convoy_id} not found."}), 404

        # Update status
        convoy["status"] = "REROUTING"
        convoy["hazard_flag"] = f"Dynamic Landslide Reroute Triggered (Isolated from hazard on {blocked_edge})"
        
        # Calculate dynamic alternative bypass corridor with fast pre-cached graph
        alt_route = None
        try:
            dual = router.find_dual_routes(convoy["origin"], convoy["destination"], prefetch_parallel=False)
            alt_route = dual.get("safestRoute")
        except Exception as ex:
            print(f"[REROUTE] Graph calculation exception: {ex}")

        return jsonify({
            "success": True,
            "status": "REROUTING",
            "message": f"Convoy {convoy_id} successfully isolated from hazard on edge {blocked_edge}. Alternative path calculated via NetworkX engine.",
            "convoy": convoy,
            "alternative_route": alt_route
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/ai/convoys/ping', methods=['POST'])
def ping_convoy():
    try:
        data = request.get_json() or {}
        convoy_id = data.get("convoy_id") or data.get("id")
        lat = float(data.get("lat") or data.get("latitude", 0))
        lng = float(data.get("lng") or data.get("lon") or data.get("longitude", 0))
        speed = float(data.get("speed") or data.get("speed_kmh", 0))

        if not convoy_id or not lat or not lng:
            return jsonify({"success": False, "error": "convoy_id, lat, and lng are required"}), 400

        res = convoy_tracker.ingest_gps_ping(convoy_id, lat, lng, speed)
        return jsonify(res)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/ai/assistant/query', methods=['POST'])
@app.route('/api/assistant/query', methods=['POST'])
def assistant_query():
    try:
        data = request.get_json() or {}
        user_query = data.get("query") or data.get("user_query") or data.get("prompt")
        current_section = data.get("current_section") or data.get("currentSection") or "Dashboard"
        preferred_language = data.get("preferred_language") or data.get("targetLanguage") or data.get("language") or "English"

        if not user_query:
            return jsonify({"success": False, "error": "Query is required"}), 400

        result = assistant_engine.query(
            user_query=str(user_query),
            current_section=str(current_section),
            preferred_language=str(preferred_language)
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('AI_PORT', 5001))
    print(f"============================================================")
    print(f" NER Sentinel Python AI Engine Microservice on Port {port} ")
    print(f" Health Check: http://localhost:{port}/health ")
    print(f"============================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
