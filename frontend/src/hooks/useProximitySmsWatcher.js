import { useEffect, useRef } from "react";
import { calculateHaversineDistance } from "../utils/geoProximity";
import { API_BASE_URL } from "../api/api";

const COOLDOWN_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 Hours

export function useProximitySmsWatcher(disruptions, pinConfig) {
  const dispatchingRef = useRef(false);

  useEffect(() => {
    if (!pinConfig?.alertsEnabled || !pinConfig?.phone || !disruptions?.length) return;
    if (dispatchingRef.current) return;

    const rawLog = localStorage.getItem("purvasetu_sms_cooldown_registry");
    const cooldownRegistry = rawLog ? JSON.parse(rawLog) : {};
    const now = Date.now();

    for (const incident of disruptions) {
      // 1. Severity Filter
      const sev = (incident.severity || "").toUpperCase();
      if (sev !== "CRITICAL_BLOCKED" && sev !== "CRITICAL") continue;

      // 2. Geometric Coordinate Extraction
      const incLat = incident.geometry?.coordinates?.[1] ?? 
                     incident.coordinates?.[1] ?? 
                     (typeof incident.lat === "number" ? incident.lat : incident.location?.lat);
      const incLng = incident.geometry?.coordinates?.[0] ?? 
                     incident.coordinates?.[0] ?? 
                     (typeof incident.lng === "number" ? incident.lng : incident.location?.lng);

      let isWithinZone = false;
      let distanceLabel = "";

      if (typeof incLat === "number" && typeof incLng === "number" && pinConfig.hubCoords) {
        const distanceKm = calculateHaversineDistance(pinConfig.hubCoords, { lat: incLat, lng: incLng });
        if (distanceKm <= pinConfig.radiusKm) {
          isWithinZone = true;
          distanceLabel = `~${Math.round(distanceKm)} km from ${pinConfig.hubName}`;
        }
      } else if (
        (incident.state && pinConfig.stateName && incident.state.toLowerCase() === pinConfig.stateName.toLowerCase()) ||
        (incident.stateId && pinConfig.stateId && incident.stateId === pinConfig.stateId)
      ) {
        // Fallback state corridor match
        isWithinZone = true;
        distanceLabel = `${pinConfig.stateName || 'Regional'} Transit Corridor`;
      }

      if (isWithinZone) {
        const incidentId = incident.id || incident.title || incident.corridor || "incident";
        const dedupeKey = `${pinConfig.phone.trim()}_${incidentId.toString().toLowerCase().trim()}`;
        const lastSent = cooldownRegistry[dedupeKey];

        // 3. Deduplication Check
        if (!lastSent || (now - lastSent) > COOLDOWN_WINDOW_MS) {
          dispatchingRef.current = true;

          const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/v1/alerts/send-sms` : "/api/alerts/send-sms";

          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: pinConfig.phone,
              corridor: incident.title || incident.corridor || "Critical Highway Link",
              locationContext: distanceLabel,
              cause: incident.category || incident.description || incident.disruption_type || "Complete Road Impassability",
            }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.status === "SENT" || res.success) {
                cooldownRegistry[dedupeKey] = Date.now();
                localStorage.setItem("purvasetu_sms_cooldown_registry", JSON.stringify(cooldownRegistry));
                console.log(`[SMS Dispatched] Verified closure alert sent to ${pinConfig.phone} for ${incident.title}`);
              }
            })
            .catch((err) => console.error("[SMS Dispatch Failed]", err))
            .finally(() => {
              dispatchingRef.current = false;
            });

          break; // Prevent rate exhaustion: process single incident per poll
        }
      }
    }
  }, [disruptions, pinConfig]);
}

export default useProximitySmsWatcher;
