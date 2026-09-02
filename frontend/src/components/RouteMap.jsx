import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue in React/Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

const RouteMap = () => {
  const [route, setRoute] = useState([]);

  // Guwahati
  const guwahati = [26.1445, 91.7362];

  // Nongpoh
  const nongpoh = [25.9023, 91.8769];

  // Shillong
  const shillong = [25.5788, 91.8933];

  useEffect(() => {
    // For now showing route points
    // Later this can be replaced with backend/OSRM route geometry

    setRoute([
      guwahati,
      nongpoh,
      shillong,
    ]);
  }, []);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

      <MapContainer
        center={[25.9, 91.82]}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full"
      >

        {/* Map Tiles */}
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="YOUR_OPENSTREETMAP_TILE_URL"
        />

        {/* Route */}
        <Polyline
          positions={route}
          pathOptions={{
            weight: 6,
            opacity: 0.8,
          }}
        />

        {/* Guwahati */}
        <Marker position={guwahati}>
          <Popup>
            <strong>Guwahati</strong>
            <br />
            Starting Point
          </Popup>
        </Marker>

        {/* Nongpoh */}
        <CircleMarker
          center={nongpoh}
          radius={10}
          pathOptions={{
            weight: 3,
          }}
        >
          <Popup>
            <strong>Nongpoh</strong>
            <br />
            Route Checkpoint
          </Popup>
        </CircleMarker>

        {/* Shillong */}
        <Marker position={shillong}>
          <Popup>
            <strong>Shillong</strong>
            <br />
            Destination
          </Popup>
        </Marker>

      </MapContainer>

    </div>
  );
};

export default RouteMap;