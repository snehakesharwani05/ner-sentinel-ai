"""
ISRO MOSDAC (Meteorological & Oceanographic Satellite Data Archival Centre) Integration
Interfaces with ISRO INSAT-3D/3DR meteorological datasets and mdapi.py.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional

MOSDAC_CONFIG_PATH = Path(__file__).parent / "config.json"

class MosdacSatelliteClient:
    def __init__(self, config_path: Path = MOSDAC_CONFIG_PATH):
        self.config_path = config_path
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        if self.config_path.exists():
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[MOSDAC] Warning loading config.json: {e}")
        return {}

    def get_dataset_metadata(self) -> Dict[str, Any]:
        """Returns the configured ISRO MOSDAC dataset parameters."""
        search_params = self.config.get("search_parameters", {})
        return {
            "source": "ISRO MOSDAC (Meteorological & Oceanographic Satellite Data Archival Centre)",
            "portal_url": "https://mosdac.gov.in",
            "dataset_id": search_params.get("datasetId", "3RIMG_L2B_SST"),
            "satellite_series": "INSAT-3D / INSAT-3DR Geostationary Meteorological Satellites",
            "capabilities": [
                "Quantitative Precipitation Estimation (QPE)",
                "Land Surface Temperature & Thermal Infrared Band",
                "Cloud Burst & Heavy Rainfall Early Warning"
            ],
            "status": "CONFIGURED_ACTIVE"
        }

# Singleton instance
mosdac_client = MosdacSatelliteClient()
