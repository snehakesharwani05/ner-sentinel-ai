"""
NER Sentinel AI - Automated Test Suite
Verifies Telemetry Providers, ML Model Predictions, Failover Resiliency,
and Cross-State Graph Routing across North Eastern India.
"""

import unittest
from pathlib import Path
from telemetry import OpenMeteoClient, TomTomClient, ResilientTelemetryProvider
from network_router import NERNetworkRouter
from riskEngine import NERRiskSentinelAI

class TestNERSentinelAI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = NERRiskSentinelAI()

    def test_open_meteo_live_telemetry(self):
        """Test fetching live Open-Meteo weather data."""
        data = OpenMeteoClient.fetch_weather(26.1445, 91.7362)  # Guwahati
        self.assertTrue(data.get("success"), f"Open-Meteo call failed: {data}")
        self.assertIn("temperature_c", data)
        self.assertIn("precipitation_mm", data)
        self.assertIn("soil_moisture", data)
        self.assertGreaterEqual(data["soil_moisture"], 0.0)

    def test_tomtom_live_traffic_flow(self):
        """Test fetching live TomTom traffic flow data."""
        client = TomTomClient()
        data = client.fetch_traffic_flow(26.1445, 91.7362)  # Guwahati
        self.assertTrue(data.get("success"), f"TomTom call failed: {data}")
        self.assertIn("current_speed_kmh", data)
        self.assertIn("jam_factor", data)
        self.assertGreaterEqual(data["jam_factor"], 0.0)

    def test_resilient_telemetry_failover(self):
        """Test mutual failover when polling telemetry."""
        provider = ResilientTelemetryProvider()
        data = provider.get_corridor_telemetry(27.5050, 92.1058, "Sela Pass")
        self.assertIn("precipitation_mm", data)
        self.assertIn("current_speed_kmh", data)
        self.assertIn("weather_source", data)
        self.assertIn("traffic_source", data)

    def test_cross_state_routing_siliguri_to_gangtok(self):
        """Test routing from West Bengal Gateway to Sikkim."""
        res = self.engine.route("Siliguri", "Gangtok", mode="safest")
        self.assertTrue(res.get("success"), f"Routing failed: {res}")
        self.assertEqual(res["nodes_in_path"][0], "Siliguri")
        self.assertEqual(res["nodes_in_path"][-1], "Gangtok")
        self.assertGreater(res["total_distance_km"], 0)

    def test_cross_state_routing_guwahati_to_tawang(self):
        """Test routing from Assam capital to Arunachal mountain pass."""
        res = self.engine.route("Guwahati", "Tawang", mode="safest")
        self.assertTrue(res.get("success"), f"Routing failed: {res}")
        self.assertIn("Sela Pass", res["nodes_in_path"])
        self.assertEqual(res["nodes_in_path"][-1], "Tawang")

    def test_cross_state_routing_silchar_to_imphal(self):
        """Test routing from Barak Valley to Manipur capital."""
        res = self.engine.route("Silchar", "Imphal", mode="safest")
        self.assertTrue(res.get("success"), f"Routing failed: {res}")
        self.assertEqual(res["nodes_in_path"][0], "Silchar")
        self.assertEqual(res["nodes_in_path"][-1], "Imphal")

    def test_model_inference_on_corridor(self):
        """Test ML model inference on single corridor."""
        eval_res = self.engine.assess_corridor("Guwahati", "Nagaon")
        self.assertIn("predicted_state", eval_res)
        self.assertIn("disaster_risk_score", eval_res)
        self.assertIn(eval_res["predicted_state"], ["CLEAR", "MODERATE_JAM", "HEAVY_JAM", "HAZARD_WARNING", "CRITICAL_BLOCKED"])
        self.assertGreaterEqual(eval_res["disaster_risk_score"], 0.0)
        self.assertLessEqual(eval_res["disaster_risk_score"], 1.0)

if __name__ == "__main__":
    unittest.main(verbosity=2)
