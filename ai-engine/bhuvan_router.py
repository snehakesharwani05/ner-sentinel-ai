"""
ISRO Bhuvan National Geoportal Integration Module
Integrates Indian Space Research Organisation (ISRO) Bhuvan Shortest Path Routing API.
"""

import requests
import json
import math
from typing import Dict, List, Any, Optional

BHUVAN_TOKEN = "8a76956a280ae337564ba0aefd7c3eb3d521a0c9"
BHUVAN_ROUTING_URL = "https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php"

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class BhuvanRouter:
    def __init__(self, token: str = BHUVAN_TOKEN):
        self.token = token
        self.cache: Dict[str, Any] = {}

    def get_shortest_path(self, lat1: float, lon1: float, lat2: float, lon2: float) -> Optional[Dict[str, Any]]:
        """
        Calls ISRO Bhuvan Shortest Path API.
        Returns GeoJSON coordinates, calculated distance in km, and metadata.
        """
        cache_key = f"{round(lat1, 4)},{round(lon1, 4)}->{round(lat2, 4)},{round(lon2, 4)}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        params = {
            "lat1": lat1,
            "lon1": lon1,
            "lat2": lat2,
            "lon2": lon2,
            "token": self.token
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            res = requests.get(BHUVAN_ROUTING_URL, params=params, headers=headers, timeout=6)
            if res.status_code == 200:
                text = res.text.strip()
                if text.startswith("{") and "FeatureCollection" in text:
                    data = res.json()
                    features = data.get("features", [])
                    
                    # Flatten coordinates from MultiLineString / LineString
                    all_coords = []
                    for f in features:
                        geom = f.get("geometry", {})
                        g_type = geom.get("type")
                        coords = geom.get("coordinates", [])
                        if g_type == "MultiLineString":
                            for line in coords:
                                for pt in line:
                                    all_coords.append([pt[1], pt[0]]) # [lat, lng]
                        elif g_type == "LineString":
                            for pt in coords:
                                all_coords.append([pt[1], pt[0]])

                    if all_coords:
                        # Calculate high-resolution total distance along Bhuvan points
                        total_dist_km = 0.0
                        for i in range(len(all_coords) - 1):
                            total_dist_km += haversine_distance_km(
                                all_coords[i][0], all_coords[i][1],
                                all_coords[i+1][0], all_coords[i+1][1]
                            )

                        result = {
                            "source": "ISRO Bhuvan National Geoportal (Official Shortest Path API)",
                            "is_isro_verified": True,
                            "total_distance_km": round(total_dist_km, 1),
                            "coordinates": all_coords,
                            "points_count": len(all_coords)
                        }
                        self.cache[cache_key] = result
                        return result

        except Exception as e:
            print(f"[ISRO Bhuvan] Routing API call failed or timed out: {e}")

        return None

# Singleton instance
bhuvan_router = BhuvanRouter()
