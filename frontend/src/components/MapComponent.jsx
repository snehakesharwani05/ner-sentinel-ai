import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


/* =====================================================
   FIT MAP TO ACTIVE ROUTES
===================================================== */

function FitMapBounds({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) {
      return;
    }

    // If there is only one point
    if (coordinates.length === 1) {
      map.setView(coordinates[0], 10);
      return;
    }

    map.fitBounds(coordinates, {
      padding: [50, 50],
      maxZoom: 10,
    });
  }, [coordinates, map]);

  return null;
}


/* =====================================================
   GET COORDINATES SAFELY

   Supports both:

   {
     latitude,
     longitude
   }

   and

   {
     lat,
     lng
   }
===================================================== */

function getCoordinates(location) {
  if (!location) return null;

  const lat = location.latitude ?? location.lat;
  const lng = location.longitude ?? location.lng;

  if (
    lat === undefined ||
    lat === null ||
    lng === undefined ||
    lng === null
  ) {
    return null;
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return [latitude, longitude];
}


/* =====================================================
   MAIN MAP COMPONENT
===================================================== */

export function MapComponent({
  locations = [],
  disruptions = [],
  fastestRoute = null,
  safestRoute = null,
  convoys = [],
}) {

  /* =====================================================
     DEFAULT MAP CENTER
     North East India
  ===================================================== */

  const defaultCenter = [26.2, 92.9];


  /* =====================================================
     FASTEST ROUTE COORDINATES
  ===================================================== */

  const fastestCoordinates = useMemo(() => {
    if (!fastestRoute?.pathNodes) {
      return [];
    }

    return fastestRoute.pathNodes
      .map(getCoordinates)
      .filter(Boolean);

  }, [fastestRoute]);


  /* =====================================================
     SAFEST ROUTE COORDINATES
  ===================================================== */

  const safestCoordinates = useMemo(() => {
    if (!safestRoute?.pathNodes) {
      return [];
    }

    return safestRoute.pathNodes
      .map(getCoordinates)
      .filter(Boolean);

  }, [safestRoute]);


  /* =====================================================
     ALL ROUTE POINTS
     Used for automatic map zoom
  ===================================================== */

  const allRouteCoordinates = useMemo(() => {
    return [
      ...fastestCoordinates,
      ...safestCoordinates,
    ];
  }, [fastestCoordinates, safestCoordinates]);


  /* =====================================================
     ACTIVE NODE IDs
  ===================================================== */

  const fastestNodeIds = new Set(
    fastestRoute?.pathNodes?.map((node) => node.id) || []
  );

  const safestNodeIds = new Set(
    safestRoute?.pathNodes?.map((node) => node.id) || []
  );

  /* =====================================================
     REFUELING STATIONS ALONG ROUTE
  ===================================================== */
  const refuelingStations = useMemo(() => {
    const list = safestRoute?.refueling_stations || fastestRoute?.refueling_stations || [];
    return Array.isArray(list) ? list : [];
  }, [safestRoute, fastestRoute]);


  /* =====================================================
     GET LOCATION MARKER STYLE
  ===================================================== */

  const getLocationStyle = (location) => {

    const isFastestRoute =
      fastestNodeIds.has(location.id);

    const isSafestRoute =
      safestNodeIds.has(location.id);

    const isCapital =
      location.location_type === "state_capital";

    const isPass =
      location.location_type === "mountain_pass";


    let fillColor = "#30483B";
    let radius = 5;


    // State capital
    if (isCapital) {
      fillColor = "#20231F";
      radius = 8;
    }


    // Mountain pass
    if (isPass) {
      fillColor = "#B8944A";
      radius = 7;
    }


    // Both routes use this node
    if (isFastestRoute && isSafestRoute) {
      fillColor = "#7C3AED";
      radius = 10;
    }


    // Fastest route only
    else if (isFastestRoute) {
      fillColor = "#16A34A";
      radius = 9;
    }


    // Safest route only
    else if (isSafestRoute) {
      fillColor = "#2563EB";
      radius = 9;
    }


    return {
      fillColor,
      radius,
    };
  };


  /* =====================================================
     DISRUPTION COLOR
  ===================================================== */

  const getDisruptionColor = (disruption) => {

    const severity = String(
      disruption.severity ||
      disruption.risk_level ||
      "medium"
    ).toLowerCase();


    if (
      severity === "critical" ||
      severity === "high"
    ) {
      return "#DC2626";
    }


    if (severity === "medium") {
      return "#F59E0B";
    }


    return "#16A34A";
  };


  /* =====================================================
     GET DISRUPTION COORDINATES

     Supports multiple possible backend formats
  ===================================================== */

  const getDisruptionCoordinates = (disruption) => {

    const directCoordinates =
      getCoordinates(disruption);

    if (directCoordinates) {
      return directCoordinates;
    }


    // Try location object if backend returns one
    if (disruption.location) {
      return getCoordinates(
        disruption.location
      );
    }


    return null;
  };


  /* =====================================================
     GET ORIGIN / DESTINATION
  ===================================================== */

  const originNode =
    safestRoute?.pathNodes?.[0] ||
    fastestRoute?.pathNodes?.[0];

  const destinationNode =
    safestRoute?.pathNodes?.[
      safestRoute.pathNodes.length - 1
    ] ||
    fastestRoute?.pathNodes?.[
      fastestRoute.pathNodes.length - 1
    ];


  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "520px",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid rgba(48, 72, 59, 0.2)",
        boxShadow:
          "0 8px 30px rgba(32, 35, 31, 0.12)",
      }}
    >

      {/* =====================================================
          MAP TITLE
      ===================================================== */}

      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 1000,
          background: "#FFFFFF",
          padding: "10px 16px",
          borderRadius: "12px",
          fontSize: "0.85rem",
          fontWeight: "700",
          color: "#20231F",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.15)",
          border:
            "1px solid rgba(48, 72, 59, 0.12)",
        }}
      >
        🗺️ NER Intelligent Road Network
      </div>


      {/* =====================================================
          LEAFLET MAP
      ===================================================== */}

      <MapContainer
        center={defaultCenter}
        zoom={7}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >

        {/* =====================================================
            OPEN STREET MAP TILES
        ===================================================== */}

        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =====================================================
            AUTOMATIC MAP ZOOM
        ===================================================== */}

        {allRouteCoordinates.length > 0 && (
          <FitMapBounds
            coordinates={allRouteCoordinates}
          />
        )}


        {/* =====================================================
            FASTEST ROUTE
            GREEN
        ===================================================== */}

        {fastestCoordinates.length > 1 && (
          <Polyline
            positions={fastestCoordinates}
            pathOptions={{
              color: "#16A34A",
              weight: 7,
              opacity: 0.85,
            }}
          />
        )}


        {/* =====================================================
            SAFEST ROUTE
            BLUE + DASHED

            If both routes are identical,
            the blue dashed line allows the
            user to still see that both algorithms
            selected the same corridor.
        ===================================================== */}

        {safestCoordinates.length > 1 && (
          <Polyline
            positions={safestCoordinates}
            pathOptions={{
              color: "#2563EB",
              weight: 5,
              opacity: 0.9,
              dashArray: "10 10",
            }}
          />
        )}


        {/* =====================================================
            ALL LOCATIONS
        ===================================================== */}

        {locations.map((location) => {

          const coordinates =
            getCoordinates(location);

          if (!coordinates) {
            return null;
          }


          const {
            fillColor,
            radius,
          } = getLocationStyle(location);


          const isOrigin =
            originNode &&
            location.id === originNode.id;

          const isDestination =
            destinationNode &&
            location.id === destinationNode.id;


          return (
            <CircleMarker
              key={`location-${location.id}`}
              center={coordinates}
              radius={
                isOrigin || isDestination
                  ? 12
                  : radius
              }
              pathOptions={{
                color: "#FFFFFF",
                weight:
                  isOrigin || isDestination
                    ? 3
                    : 2,
                fillColor:
                  isOrigin
                    ? "#16A34A"
                    : isDestination
                    ? "#DC2626"
                    : fillColor,
                fillOpacity: 0.95,
              }}
            >

              {/* Location name on hover */}

              <Tooltip
                direction="top"
                offset={[0, -10]}
              >
                <strong>
                  {location.name}
                </strong>
              </Tooltip>


              {/* Location information */}

              <Popup>
                <div
                  style={{
                    minWidth: "160px",
                    fontSize: "13px",
                  }}
                >

                  <strong
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    {location.name}
                  </strong>


                  <br />

                  <span>
                    📍 {location.state}
                  </span>


                  <br />

                  <span>
                    🛣️ {location.location_type}
                  </span>


                  {location.elevation_m && (
                    <>
                      <br />

                      <span>
                        ⛰️ Elevation:{" "}
                        {location.elevation_m} m
                      </span>
                    </>
                  )}


                  {isOrigin && (
                    <>
                      <br />
                      <br />

                      <strong
                        style={{
                          color: "#16A34A",
                        }}
                      >
                        🟢 Route Origin
                      </strong>
                    </>
                  )}


                  {isDestination && (
                    <>
                      <br />
                      <br />

                      <strong
                        style={{
                          color: "#DC2626",
                        }}
                      >
                        🔴 Route Destination
                      </strong>
                    </>
                  )}

                </div>
              </Popup>

            </CircleMarker>
          );
        })}


        {/* =====================================================
            DISRUPTION / HAZARD MARKERS
        ===================================================== */}

        {disruptions.map((disruption) => {

          const coordinates =
            getDisruptionCoordinates(
              disruption
            );

          if (!coordinates) {
            return null;
          }


          const disruptionColor =
            getDisruptionColor(
              disruption
            );


          return (
            <CircleMarker
              key={`disruption-${disruption.id}`}
              center={coordinates}
              radius={13}
              pathOptions={{
                color: "#FFFFFF",
                weight: 3,
                fillColor: disruptionColor,
                fillOpacity: 0.95,
              }}
            >

              <Tooltip
                direction="top"
              >
                ⚠️{" "}
                {disruption.type ||
                  disruption.disruption_type ||
                  "Road Disruption"}
              </Tooltip>


              <Popup>
                <div
                  style={{
                    minWidth: "180px",
                    fontSize: "13px",
                  }}
                >

                  <strong>
                    ⚠️{" "}
                    {disruption.type ||
                      disruption.disruption_type ||
                      "Road Disruption"}
                  </strong>


                  <br />
                  <br />


                  <span>
                    Severity:{" "}

                    {disruption.severity ||
                      disruption.risk_level ||
                      "Unknown"}
                  </span>


                  {disruption.description && (
                    <>
                      <br />
                      <br />

                      <span>
                        {disruption.description}
                      </span>
                    </>
                  )}

                </div>
              </Popup>

            </CircleMarker>
          );
        })}

        {/* =====================================================
            EN-ROUTE REFUELING & FUEL STAGING STATIONS
        ===================================================== */}
        {refuelingStations.map((st) => (
          <CircleMarker
            key={`fuel-marker-${st.id}`}
            center={[st.latitude, st.longitude]}
            radius={8}
            pathOptions={{
              color: "#FFFFFF",
              weight: 2,
              fillColor: "#F59E0B",
              fillOpacity: 0.95,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <strong>⛽ {st.brand}: {st.name} ({st.distance_from_origin_km} km)</strong>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: "220px", fontSize: "13px", color: "#20231F" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "800", color: "#B8944A" }}>⛽ {st.brand} Station</span>
                  <span style={{ fontSize: "11px", background: "#30483B", color: "#FFFFFF", padding: "1px 5px", borderRadius: "4px" }}>Active</span>
                </div>
                <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>{st.name}</strong>
                <div style={{ fontSize: "12px", opacity: 0.85, marginBottom: "4px" }}>
                  📍 Position: <strong>Km {st.distance_from_origin_km}</strong> from origin (Alt: {st.elevation_m}m)
                </div>
                <div style={{ fontSize: "11px", background: "rgba(48,72,59,0.08)", padding: "4px 6px", borderRadius: "4px", marginBottom: "4px" }}>
                  <strong>Fuels:</strong> {Array.isArray(st.fuel_types) ? st.fuel_types.join(", ") : "Diesel, Petrol"}
                </div>
                {st.has_ev_charging && (
                  <div style={{ fontSize: "11px", color: "#16A34A", fontWeight: "700", marginBottom: "3px" }}>
                    ⚡ EV Fast Charging Available
                  </div>
                )}
                <div style={{ fontSize: "11px", color: "#30483B", fontWeight: "600" }}>
                  🟢 {st.status}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* =====================================================
            ACTIVE DISASTER RELIEF & ESSENTIAL SUPPLY CONVOYS
        ===================================================== */}
        {convoys.map((c) => {
          const isDelayed = c.status === "DELAYED_LANDSLIDE";
          const isRerouting = c.status === "REROUTING";
          const statusColor = isDelayed ? "#EF4444" : (isRerouting ? "#F59E0B" : "#10B981");
          const typeIcon = c.commodity_type === "POL_TANKER" ? "⛽" : (c.commodity_type === "MEDICAL_AID" ? "💊" : (c.commodity_type === "FOOD_GRAINS" ? "🌾" : "🚛"));

          return (
            <CircleMarker
              key={c.convoy_id}
              center={[c.current_lat, c.current_lng]}
              radius={9}
              pathOptions={{
                color: "#FFFFFF",
                weight: 2.5,
                fillColor: statusColor,
                fillOpacity: 1.0,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <strong>{typeIcon} {c.vehicle_reg_no}: {c.name} ({c.speed_kmh} km/h)</strong>
              </Tooltip>
              <Popup>
                <div style={{ minWidth: "240px", fontSize: "13px", color: "#20231F" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", color: statusColor }}>{typeIcon} {c.commodity_type.replace('_', ' ')}</span>
                    <span style={{ fontSize: "10px", fontWeight: "700", background: statusColor, color: "#FFFFFF", padding: "2px 6px", borderRadius: "4px" }}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px", color: "#1E293B" }}>
                    {c.name} ({c.vehicle_reg_no})
                  </strong>
                  <div style={{ fontSize: "12px", background: "rgba(48,72,59,0.08)", padding: "5px 8px", borderRadius: "6px", marginBottom: "6px" }}>
                    📦 <strong>Payload:</strong> {c.payload_description} ({c.cargo_weight_tonnes}T)
                  </div>
                  <div style={{ fontSize: "12px", marginBottom: "3px" }}>
                    📍 <strong>Location:</strong> {c.current_location_name}
                  </div>
                  <div style={{ fontSize: "12px", marginBottom: "3px" }}>
                    ⚡ <strong>Speed:</strong> {c.speed_kmh} km/h • <strong>Priority:</strong> {c.priority_level}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px" }}>
                    👤 <strong>Driver:</strong> {c.driver_name} ({c.driver_contact})
                  </div>
                  {c.hazard_flag && (
                    <div style={{ fontSize: "11px", color: isDelayed ? "#EF4444" : "#D97706", background: isDelayed ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", padding: "4px 6px", borderRadius: "4px", fontWeight: "600" }}>
                      ⚠️ {c.hazard_flag}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      </MapContainer>


      {/* =====================================================
          MAP LEGEND
      ===================================================== */}

      <div
        style={{
          position: "absolute",
          bottom: "18px",
          right: "18px",
          zIndex: 1000,
          background: "#FFFFFF",
          padding: "12px 16px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 18px rgba(0,0,0,0.18)",
          border:
            "1px solid rgba(48, 72, 59, 0.12)",
          fontSize: "12px",
          color: "#20231F",
          minWidth: "185px",
        }}
      >

        <div
          style={{
            fontWeight: "700",
            marginBottom: "9px",
            fontSize: "13px",
          }}
        >
          Route & Fleet Legend
        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "7px",
          }}
        >
          <span
            style={{
              width: "24px",
              height: "4px",
              background: "#16A34A",
              borderRadius: "4px",
              display: "inline-block",
            }}
          />

          Fastest Route
        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "7px",
          }}
        >
          <span
            style={{
              width: "24px",
              borderTop:
                "4px dashed #2563EB",
              display: "inline-block",
            }}
          />

          Safest Route
        </div>

        {refuelingStations.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "7px",
            }}
          >
            <span
              style={{
                width: "11px",
                height: "11px",
                background: "#F59E0B",
                borderRadius: "50%",
                display: "inline-block",
                border: "1.5px solid #FFFFFF"
              }}
            />
            Fuel / Refueling Base ({refuelingStations.length})
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "7px",
          }}
        >
          <span
            style={{
              width: "11px",
              height: "11px",
              background: "#DC2626",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />

          Destination
        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "7px",
          }}
        >
          <span>
            ⚠️
          </span>

          Hazard / Disruption
        </div>

        {convoys.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              paddingTop: "5px",
              borderTop: "1px solid rgba(48,72,59,0.1)",
              fontSize: "11px",
              color: "#30483B",
              fontWeight: "600"
            }}
          >
            <span>🚛</span>
            Tracked Convoy ({convoys.length})
          </div>
        )}

      </div>


      {/* =====================================================
          ROUTE SUMMARY
      ===================================================== */}

      {(fastestRoute || safestRoute) && (
        <div
          style={{
            position: "absolute",
            bottom: "18px",
            left: "18px",
            zIndex: 1000,
            background: "#FFFFFF",
            padding: "10px 14px",
            borderRadius: "12px",
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.18)",
            border:
              "1px solid rgba(48, 72, 59, 0.12)",
            fontSize: "12px",
            color: "#20231F",
          }}
        >

          <div
            style={{
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            Active Analysis
          </div>


          {fastestRoute && (
            <div
              style={{
                marginBottom: "4px",
              }}
            >
              🟢 Fastest:{" "}
              {fastestRoute.totalDistanceKm} km
              {" • "}
              Risk:{" "}
              {fastestRoute.averageRiskScore}
            </div>
          )}


          {safestRoute && (
            <div>
              🔵 Safest:{" "}
              {safestRoute.totalDistanceKm} km
              {" • "}
              Risk:{" "}
              {safestRoute.averageRiskScore}
            </div>
          )}

        </div>
      )}

    </div>
  );
}


export default MapComponent;