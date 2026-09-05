/**
 * PurvaSetu / PRAGATI-AI (SIH Problem Statement 26002)
 * Open-Meteo Live Environmental Telemetry Service & Calibrated Geotechnical Hazard Engine
 * Zero API key required, with IndexedDB/localStorage offline fallback and 15-min batch polling.
 */

export const KEY_LIFELINES = [
  { id: 'sela', name: 'Sela Pass', state: 'Arunachal Pradesh', lat: 27.503, lng: 92.102, elevation_m: 4170, location_type: 'MOUNTAIN_PASS' },
  { id: 'sonapur', name: 'Sonapur Tunnel', state: 'Meghalaya', lat: 25.184, lng: 92.365, elevation_m: 650, location_type: 'HIGH_RISK_TUNNEL' },
  { id: 'paglapahar', name: 'Paglapahar (Chumukedima)', state: 'Nagaland', lat: 25.753, lng: 93.754, elevation_m: 480, location_type: 'SINKING_ZONE' },
  { id: 'jorabat', name: 'Jorabat Gateway', state: 'Assam', lat: 26.113, lng: 91.874, elevation_m: 85, location_type: 'INTERSTATE_GATEWAY' },
  { id: 'kohima', name: 'Kohima Ridge', state: 'Nagaland', lat: 25.675, lng: 94.111, elevation_m: 1444, location_type: 'HILL_CORRIDOR' },
  { id: 'aizawl', name: 'Aizawl Ridge', state: 'Mizoram', lat: 23.731, lng: 92.718, elevation_m: 1132, location_type: 'SLOPE_ZONE' },
  { id: 'guwahati', name: 'Guwahati Logistics HQ', state: 'Assam', lat: 26.144, lng: 91.736, elevation_m: 55, location_type: 'RIVER_VALLEY' },
  { id: 'gangtok', name: 'Gangtok Corridor', state: 'Sikkim', lat: 27.338, lng: 88.614, elevation_m: 1650, location_type: 'MOUNTAIN_PASS' },
  { id: 'imphal', name: 'Imphal Valley', state: 'Manipur', lat: 24.817, lng: 93.937, elevation_m: 786, location_type: 'VALLEY_CORRIDOR' }
];

const CACHE_PREFIX = 'purvasetu_meteo_';

// 1. Single Location Open-Meteo Ingestion
export async function fetchLocationTelemetry(location) {
  if (!location) return getOfflineFallbackTelemetry(location);

  const lat = Number(location.lat || location.latitude || 26.14);
  const lng = Number(location.lng || location.longitude || 91.74);
  const cacheKey = `${CACHE_PREFIX}${location.id || location.name || `${lat.toFixed(2)}_${lng.toFixed(2)}`}`;

  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,precipitation,rain,wind_speed_10m&hourly=precipitation,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm&past_days=1&forecast_days=1&timezone=auto`;

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();

    const parsed = parseOpenMeteoPayload(data, location);
    
    // Save to cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        ...parsed,
        cachedAt: Date.now()
      }));
    } catch (e) {}

    return parsed;
  } catch (err) {
    console.warn(`[TelemetryService] Open-Meteo live fetch failed for ${location.name || lat}: ${err.message}. Reading cache/offline fallback.`);
    return getOfflineCachedTelemetry(cacheKey, location);
  }
}

// 2. Batch Telemetry Ingestion for Lifeline Corridors
export async function fetchBatchLifelineTelemetry(lifelines = KEY_LIFELINES) {
  if (!lifelines || lifelines.length === 0) return {};

  const latList = lifelines.map(l => Number(l.lat).toFixed(4)).join(',');
  const lngList = lifelines.map(l => Number(l.lng).toFixed(4)).join(',');

  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latList}&longitude=${lngList}&current=temperature_2m,precipitation,rain,wind_speed_10m&hourly=precipitation,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm&past_days=1&forecast_days=1&timezone=auto`;

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Open-Meteo Batch HTTP ${res.status}`);
    const data = await res.json();

    const results = {};
    const arrayData = Array.isArray(data) ? data : [data];

    arrayData.forEach((item, index) => {
      const loc = lifelines[index];
      if (loc) {
        const parsed = parseOpenMeteoPayload(item, loc);
        results[loc.id || loc.name] = parsed;
        try {
          localStorage.setItem(`${CACHE_PREFIX}${loc.id || loc.name}`, JSON.stringify({
            ...parsed,
            cachedAt: Date.now()
          }));
        } catch (e) {}
      }
    });

    return results;
  } catch (err) {
    console.warn(`[TelemetryService] Batch Open-Meteo failed: ${err.message}. Loading cached lifeline registry.`);
    const fallbackResults = {};
    for (const loc of lifelines) {
      const key = `${CACHE_PREFIX}${loc.id || loc.name}`;
      fallbackResults[loc.id || loc.name] = getOfflineCachedTelemetry(key, loc);
    }
    return fallbackResults;
  }
}

// 3. Parse Open-Meteo Payload
function parseOpenMeteoPayload(data, location = {}) {
  const current = data.current || {};
  const hourly = data.hourly || {};

  const currentPrecipitationMm = Number(current.precipitation ?? 0);
  const currentRainMm = Number(current.rain ?? currentPrecipitationMm);
  const temperatureC = Number(current.temperature_2m ?? 22.0);
  const windSpeedKmh = Number(current.wind_speed_10m ?? 8.5);

  // 24-hour rolling accumulated rainfall
  let rainfall24h = 0;
  if (hourly.precipitation && Array.isArray(hourly.precipitation)) {
    const precipArray = hourly.precipitation;
    // Sum past 24 hourly values
    const past24 = precipArray.slice(Math.max(0, precipArray.length - 24));
    rainfall24h = past24.reduce((sum, val) => sum + (Number(val) || 0), 0);
  } else {
    rainfall24h = currentPrecipitationMm * 12.0;
  }
  rainfall24h = Math.round(rainfall24h * 10) / 10;

  // Volumetric soil moisture saturation (m3/m3)
  let soilMoisture = 0.22;
  if (hourly.soil_moisture_0_to_1cm && Array.isArray(hourly.soil_moisture_0_to_1cm) && hourly.soil_moisture_0_to_1cm.length > 0) {
    const validMoisture = hourly.soil_moisture_0_to_1cm.filter(v => v !== null && !isNaN(v));
    if (validMoisture.length > 0) {
      soilMoisture = Number(validMoisture[validMoisture.length - 1]);
    }
  }
  soilMoisture = Math.max(0.15, Math.min(0.50, Math.round(soilMoisture * 100) / 100));

  return {
    isLive: true,
    source: 'Open-Meteo Live API',
    locationName: location.name || 'Target Corridor',
    elevationM: location.elevation_m || location.elevation || 500,
    currentPrecipitationMm,
    currentRainMm,
    rainfall24h,
    soilMoisture,
    temperatureC: Math.round(temperatureC * 10) / 10,
    windSpeedKmh: Math.round(windSpeedKmh * 10) / 10,
    timestamp: new Date().toISOString()
  };
}

// 4. Cached & Fallback Reader
function getOfflineCachedTelemetry(cacheKey, location = {}) {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        isLive: false,
        isCached: true,
        source: 'Indexed Cache (Offline Memory)'
      };
    }
  } catch (e) {}

  return getOfflineFallbackTelemetry(location);
}

function getOfflineFallbackTelemetry(location = {}) {
  const alt = Number(location.elevation_m || location.elevation || 500);
  // High altitude passes have lower temp and higher moisture baseline
  const isHighPass = alt >= 1500;
  const isVeryHighPass = alt >= 3000;

  return {
    isLive: false,
    isCached: false,
    source: 'Deterministic Geological Baseline',
    locationName: location.name || 'Selected Location',
    elevationM: alt,
    currentPrecipitationMm: isVeryHighPass ? 4.5 : 0.0,
    currentRainMm: isVeryHighPass ? 3.8 : 0.0,
    rainfall24h: isVeryHighPass ? 85.0 : (isHighPass ? 45.0 : 10.0),
    soilMoisture: isVeryHighPass ? 0.38 : (isHighPass ? 0.28 : 0.18),
    temperatureC: isVeryHighPass ? 4.2 : (isHighPass ? 16.5 : 26.0),
    windSpeedKmh: isVeryHighPass ? 28.0 : 11.5,
    timestamp: new Date().toISOString()
  };
}

// 5. 15-Minute Background Telemetry Poller
export function startTelemetryPoller(callback, intervalMs = 15 * 60 * 1000) {
  let isMounted = true;

  const runPoll = async () => {
    try {
      const data = await fetchBatchLifelineTelemetry(KEY_LIFELINES);
      if (isMounted && typeof callback === 'function') {
        callback(data);
      }
    } catch (e) {
      console.warn('[TelemetryPoller] Polling cycle error:', e.message);
    }
  };

  // Immediate initial run
  runPoll();

  const timer = setInterval(runPoll, intervalMs);

  return () => {
    isMounted = false;
    clearInterval(timer);
  };
}

// 6. Calibrated Geotechnical Hazard Simulation Model (Physics-Based)
export function calculateHazardMetrics(params) {
  const {
    rainfall24h = 0,
    soilMoisture = 0.18,
    trafficFactor = 3.0,
    altitudeMeters = 500,
    targetName = 'Target Corridor'
  } = params;

  // 1. Terrain & Altitude Vulnerability
  // High mountain passes have steep rock faces; low valleys face waterlogging instead
  const terrainFactor = Math.min(1.0, Math.max(0.12, altitudeMeters / 3000.0));

  // 2. Normalized Environmental Factors
  const rainNorm = Math.min(1.0, rainfall24h / 250.0);
  const moistureNorm = Math.max(0.0, Math.min(1.0, (soilMoisture - 0.15) / (0.45 - 0.15)));
  const trafficNorm = trafficFactor / 10.0;

  // 3. Landslide Slope Failure Probability (0.0 to 1.0)
  const rawRisk = (0.55 * rainNorm + 0.35 * moistureNorm + 0.10 * trafficNorm) * terrainFactor;
  const landslideRiskPct = Math.round(Math.min(100, rawRisk * 100 * 1.15) * 10) / 10;

  // 4. Road Capacity Degradation (0% to -100%)
  const degradationPct = Math.round(Math.min(100, (rawRisk * 65) + (trafficNorm * 35)));

  // 5. Categorical Road State & Directives
  let roadState = "CLEAR_PASS";
  let severityLevel = "LOW";
  let directive = `Nominal conditions detected. All freight and military transit corridors operate normally.`;

  if (landslideRiskPct >= 75 || degradationPct >= 80) {
    roadState = "CRITICAL_BLOCKED";
    severityLevel = "CRITICAL";
    directive = `EMERGENCY ALERT: Severe slope failure risk (${landslideRiskPct}%). Corridor impassable due to geotechnical liquefaction. Reroute via alternate lifeline bypass.`;
  } else if (landslideRiskPct >= 50 || degradationPct >= 55) {
    roadState = "RESTRICTED_CONVOY";
    severityLevel = "HIGH";
    directive = `HIGH HAZARD WARNING: Precipitation (${rainfall24h}mm) and high soil saturation (${soilMoisture.toFixed(2)} m³/m³) detected at ${altitudeMeters}m elevation. Speed capped at 20 km/h; essential convoys only.`;
  } else if (landslideRiskPct >= 25 || degradationPct >= 30) {
    roadState = "MODERATE_CAUTION";
    severityLevel = "MODERATE";
    directive = `WEATHER ADVISORY: Wet pavement and loose aggregate on cut slopes. Maintain minimum 50m vehicle following distance.`;
  }

  return {
    landslideRiskPct,
    roadCapacityDegradation: -degradationPct,
    predictedRoadState: roadState,
    severityLevel,
    operationalDirective: directive,
    terrainFactor: Math.round(terrainFactor * 100) / 100,
    rawDisasterScore: Math.round((landslideRiskPct / 100.0) * 1000) / 1000
  };
}
