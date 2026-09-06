/**
 * PurvaSetu / PRAGATI-AI (SIH Problem Statement 26002)
 * Haversine Proximity Calculator & Transit Hub Radial Trigger Engine
 */

/**
 * Calculates the great-circle distance between two geographic coordinates in kilometers.
 */
export function calculateHaversineDistance(pt1, pt2) {
  if (!pt1 || !pt2 || typeof pt1.lat !== "number" || typeof pt2.lat !== "number" || typeof pt1.lng !== "number" || typeof pt2.lng !== "number") {
    return Infinity;
  }

  const toRad = (val) => (val * Math.PI) / 180;
  const EARTH_RADIUS_KM = 6371;

  const dLat = toRad(pt2.lat - pt1.lat);
  const dLon = toRad(pt2.lng - pt1.lng);
  const lat1 = toRad(pt1.lat);
  const lat2 = toRad(pt2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Checks if a target location is within a specified radius (in km) from a central transit hub.
 */
export function isWithinRadius(center, target, radiusKm) {
  const distance = calculateHaversineDistance(center, target);
  return distance <= radiusKm;
}

/**
 * Extracts the best approximate GeoPoint coordinates from a disruption object.
 */
export function extractDisruptionCoordinates(disruption) {
  if (!disruption) return null;

  if (typeof disruption.lat === "number" && typeof disruption.lng === "number") {
    return { lat: disruption.lat, lng: disruption.lng };
  }

  if (disruption.location && typeof disruption.location.lat === "number" && typeof disruption.location.lng === "number") {
    return { lat: disruption.location.lat, lng: disruption.location.lng };
  }

  if (disruption.coordinates && Array.isArray(disruption.coordinates) && disruption.coordinates.length >= 2) {
    return { lat: disruption.coordinates[1], lng: disruption.coordinates[0] };
  }

  return null;
}
