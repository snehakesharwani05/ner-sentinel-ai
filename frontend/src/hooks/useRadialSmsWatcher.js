import { useEffect, useRef } from "react";
import { calculateHaversineDistance } from "../utils/geoProximity";
import { API_BASE_URL } from "../api/api";

const COOLDOWN_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 Hours

export function useRadialSmsWatcher(disruptions, config) {
  const isDispatchingRef = useRef(false);

  useEffect(() => {
    if (!config?.alertsEnabled || !config?.phone || !disruptions?.length) return;
    if (isDispatchingRef.current) return;

    const rawLog = localStorage.getItem("purvasetu_sms_cooldown_registry");
    const cooldownRegistry = rawLog ? JSON.parse(rawLog) : {};
    const now = Date.now();

    for (const incident of disruptions) {
      // Step 1: Severity verification
      const sev = (incident.severity || "").toUpperCase();
      if (sev !== "CRITICAL_BLOCKED" && sev !== "CRITICAL") continue;

      // Step 2: Coordinate resolution
      const incLat = incident.geometry?.coordinates?.[1] ?? 
                     incident.coordinates?.[1] ?? 
                     (typeof incident.lat === "number" ? incident.lat : incident.location?.lat);
      const incLng = incident.geometry?.coordinates?.[0] ?? 
                     incident.coordinates?.[0] ?? 
                     (typeof incident.lng === "number" ? incident.lng : incident.location?.lng);

      if (typeof incLat !== "number" || typeof incLng !== "number") continue;

      // Step 3: Haversine distance evaluation
      const distanceKm = calculateHaversineDistance(config.hubCoords, {
        lat: incLat,
        lng: incLng,
      });

      // Step 4: Proximity filter check
      if (distanceKm <= config.radiusKm) {
        const incidentId = incident.id || incident.title || incident.corridor || "incident";
        const dedupeKey = `${config.phone.trim()}_${incidentId.toString().toLowerCase().trim()}`;
        const lastSentTimestamp = cooldownRegistry[dedupeKey];

        // Step 5: Deduplication check
        if (!lastSentTimestamp || (now - lastSentTimestamp) > COOLDOWN_WINDOW_MS) {
          isDispatchingRef.current = true;

          const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/v1/alerts/send-sms` : "/api/alerts/send-sms";

          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: config.phone,
              corridor: incident.title || incident.corridor || "Critical Corridor",
              locationContext: `${config.hubName} (~${Math.round(distanceKm)} km away)`,
              cause: incident.category || incident.description || incident.disruption_type || "Road Closure",
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.status === "SENT" || data.success) {
                cooldownRegistry[dedupeKey] = Date.now();
                localStorage.setItem("purvasetu_sms_cooldown_registry", JSON.stringify(cooldownRegistry));
                console.log(`[Proximity SMS Dispatched] Target: ${config.phone} (${Math.round(distanceKm)} km from ${config.hubName})`);
              }
            })
            .catch((err) => console.error("[Proximity SMS Failed]", err))
            .finally(() => {
              isDispatchingRef.current = false;
            });

          break; // Rate limit: dispatch single highest-priority event per polling pass
        }
      }
    }
  }, [disruptions, config]);
}

export default useRadialSmsWatcher;
