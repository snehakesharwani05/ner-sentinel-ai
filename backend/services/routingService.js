/**
 * Intelligent Routing Service
 * Builds dynamic Graph from SQLite database records and active disruptions,
 * then computes Fastest vs Safest routes using Dijkstra & A* pathfinding algorithms.
 */

const db = require('../config/db');
const { evaluateSegmentRisk } = require('./riskService');

/**
 * Builds in-memory Graph representation from database
 */
function buildGraph() {
  const locationsList = db.prepare(`SELECT * FROM locations`).all();
  const locationsMap = new Map();
  locationsList.forEach(loc => locationsMap.set(loc.id, loc));

  const roadSegments = db.prepare(`SELECT * FROM road_segments WHERE is_active = 1`).all();
  const activeDisruptions = db.prepare(`SELECT * FROM disruptions WHERE status = 'active'`).all();
  const weatherRecords = db.prepare(`SELECT * FROM weather_data`).all();

  const disruptionsMap = new Map();
  activeDisruptions.forEach(d => disruptionsMap.set(d.road_segment_id, d));

  const weatherMap = new Map();
  weatherRecords.forEach(w => weatherMap.set(w.location_id, w));

  const adjacencyList = new Map();
  locationsList.forEach(loc => adjacencyList.set(loc.id, []));

  roadSegments.forEach(segment => {
    const disruption = disruptionsMap.get(segment.id) || null;
    const originWeather = weatherMap.get(segment.origin_location_id) || null;
    const destWeather = weatherMap.get(segment.destination_location_id) || null;

    const weather = originWeather || destWeather;
    const riskEval = evaluateSegmentRisk(segment, disruption, weather);

    const edgeData = {
      segmentId: segment.id,
      highwayCode: segment.highway_code,
      originId: segment.origin_location_id,
      destinationId: segment.destination_location_id,
      distanceKm: segment.distance_km,
      baseTransitTimeMin: segment.base_transit_time_min,
      terrainType: segment.terrain_type,
      roadCondition: segment.road_condition,
      riskScore: riskEval.riskScore,
      severityBand: riskEval.severityBand,
      isBlocked: riskEval.isBlocked,
      disruption: disruption ? {
        id: disruption.id,
        type: disruption.disruption_type,
        severity: disruption.severity,
        description: disruption.description
      } : null
    };

    if (adjacencyList.has(segment.origin_location_id)) {
      adjacencyList.get(segment.origin_location_id).push(edgeData);
    }

    if (segment.is_bidirectional) {
      const reverseEdge = { ...edgeData, originId: segment.destination_location_id, destinationId: segment.origin_location_id };
      if (adjacencyList.has(segment.destination_location_id)) {
        adjacencyList.get(segment.destination_location_id).push(reverseEdge);
      }
    }
  });

  return { locationsMap, adjacencyList };
}

/**
 * Calculates Haversine distance for A* heuristic
 */
function calculateHeuristic(nodeA, nodeB) {
  if (!nodeA || !nodeB) return 0;
  const R = 6371; // Earth radius km
  const dLat = (nodeB.latitude - nodeA.latitude) * Math.PI / 180;
  const dLon = (nodeB.longitude - nodeA.longitude) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(nodeA.latitude * Math.PI / 180) * Math.cos(nodeB.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Core Pathfinding implementation (Dijkstra / A*)
 * @param {number} originId
 * @param {number} destinationId
 * @param {'fastest'|'safest'} mode
 */
function findPath(originId, destinationId, mode = 'fastest') {
  const { locationsMap, adjacencyList } = buildGraph();

  if (!locationsMap.has(originId) || !locationsMap.has(destinationId)) {
    throw new Error('Invalid origin or destination location ID');
  }

  const destNode = locationsMap.get(destinationId);
  const gScores = new Map();
  const previous = new Map();
  const edgeUsed = new Map();
  const openSet = new Set();

  locationsMap.forEach((_, id) => {
    gScores.set(id, Infinity);
    previous.set(id, null);
    edgeUsed.set(id, null);
  });

  gScores.set(originId, 0);
  openSet.add(originId);

  while (openSet.size > 0) {
    let currentId = null;
    let minFCost = Infinity;

    for (const id of openSet) {
      const g = gScores.get(id);
      let h = 0;
      
      if (mode === 'safest') {
        // Safe lower bound: straight-line distance (since weight >= distanceKm * 1.0)
        h = calculateHeuristic(locationsMap.get(id), destNode);
      } else {
        // Assuming an upper highway speed bound of 120 km/h (2 km/min)
        h = (calculateHeuristic(locationsMap.get(id), destNode) / 120) * 60;
      }

      const f = g + h;
      if (f < minFCost) {
        minFCost = f;
        currentId = id;
      }
    }

    if (currentId === null || currentId === destinationId) {
      break;
    }

    openSet.delete(currentId);
    const neighbors = adjacencyList.get(currentId) || [];

    for (const edge of neighbors) {
      if (edge.isBlocked) continue;

      let edgeCost;
      if (mode === 'fastest') {
        const delayPenalty = edge.disruption ? (edge.disruption.severity === 'high' ? 60 : 30) : 0;
        edgeCost = edge.baseTransitTimeMin + delayPenalty;
      } else {
        const SAFETY_RISK_WEIGHT = 10;

edgeCost =
  edge.distanceKm +
  (edge.distanceKm * edge.riskScore * SAFETY_RISK_WEIGHT);
      }

      const tentativeG = gScores.get(currentId) + edgeCost;
      if (tentativeG < gScores.get(edge.destinationId)) {
        gScores.set(edge.destinationId, tentativeG);
        previous.set(edge.destinationId, currentId);
        edgeUsed.set(edge.destinationId, edge);
        openSet.add(edge.destinationId);
      }
    }
  }

  if (gScores.get(destinationId) === Infinity) {
    return null;
  }

  // Reconstruct path
  const pathNodes = [];
  const pathEdges = [];
  let curr = destinationId;

  while (curr !== null) {
    pathNodes.unshift(locationsMap.get(curr));
    const edge = edgeUsed.get(curr);
    if (edge) {
      pathEdges.unshift(edge);
    }
    curr = previous.get(curr);
  }

  let totalDistanceKm = 0;
  let totalTransitTimeMin = 0;
  let weightedRiskSum = 0;
  const hazardsEncountered = [];

  pathEdges.forEach(edge => {
    totalDistanceKm += edge.distanceKm;

    const delay = edge.disruption ? (edge.disruption.severity === 'high' ? 60 : 30) : 0;
    totalTransitTimeMin += edge.baseTransitTimeMin + delay;

    weightedRiskSum += edge.riskScore * edge.distanceKm;

    if (edge.disruption) {
      hazardsEncountered.push({
        highway: edge.highwayCode,
        segment: `${locationsMap.get(edge.originId).name} -> ${locationsMap.get(edge.destinationId).name}`,
        disruption: edge.disruption
      });
    }
  });

  const avgRiskScore = totalDistanceKm > 0
    ? Number((weightedRiskSum / totalDistanceKm).toFixed(2))
    : 0;

  const severityBand =
    avgRiskScore >= 0.75 ? 'Critical' :
    avgRiskScore >= 0.50 ? 'High' :
    avgRiskScore >= 0.25 ? 'Moderate' : 'Low';

  return {
    mode,
    origin: locationsMap.get(originId),
    destination: locationsMap.get(destinationId),
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalTransitTimeMin,
    averageRiskScore: avgRiskScore,
    severityBand,
    nodesCount: pathNodes.length,
    pathNodes: pathNodes.map(n => ({ 
      id: n.id, 
      name: n.name, 
      state: n.state, 
      lat: n.latitude, 
      lng: n.longitude, 
      type: n.location_type 
    })),
    pathSegments: pathEdges.map(e => ({
      highway: e.highwayCode,
      from: locationsMap.get(e.originId).name,
      to: locationsMap.get(e.destinationId).name,
      distanceKm: e.distanceKm,
      transitTimeMin: e.baseTransitTimeMin,
      terrain: e.terrainType,
      riskScore: e.riskScore,
      severityBand: e.severityBand,
      disruption: e.disruption
    })),
    hazardsEncountered
  };
}

/**
 * Compares Fastest vs Safest route options for a given origin/destination
 */
function analyzeRoutes(originId, destinationId) {
  const fastestRoute = findPath(originId, destinationId, 'fastest');
  const safestRoute = findPath(originId, destinationId, 'safest');

  let recommendation = 'Both fastest and safest routes follow the optimal corridor.';
  if (!fastestRoute && !safestRoute) {
    recommendation = 'CRITICAL ALERT: No accessible road routes available due to active road blockages.';
  } else if (fastestRoute && safestRoute) {
    const isSamePath = JSON.stringify(fastestRoute.pathNodes.map(n => n.name)) === JSON.stringify(safestRoute.pathNodes.map(n => n.name));
    if (isSamePath) {
      safestRoute.is_lane_buffered = true;
      safestRoute.buffer_status_tag = 'Primary Arterial Corridor — Alternate Lane Buffer Applied';
      safestRoute.pathNodes = safestRoute.pathNodes.map((n, i, arr) => {
        if (i > 0 && i < arr.length - 1) {
          return {
            ...n,
            lat: Number((n.lat + 0.0004).toFixed(6)),
            lng: Number((n.lng + 0.0004).toFixed(6))
          };
        }
        return n;
      });
      recommendation = 'Primary Arterial Corridor — Alternate Lane Buffer Applied';
    } else if (fastestRoute.averageRiskScore > safestRoute.averageRiskScore) {
      recommendation = `Safest route reduces hazard risk from ${fastestRoute.averageRiskScore} (${fastestRoute.severityBand}) to ${safestRoute.averageRiskScore} (${safestRoute.severityBand}) by choosing resilient bypass roads.`;
    }
  }

  return {
    fastestRoute,
    safestRoute,
    recommendation
  };
}

function isNerCoordinate(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    !(latitude === 0 && longitude === 0) &&
    latitude >= 20.0 &&
    latitude <= 30.0 &&
    longitude >= 88.0 &&
    longitude <= 98.0
  );
}

/**
 * Real-Time AI Engine Bridge: Calls Python AI microservice (Port 5001) for live Open-Meteo & TomTom ML predictions.
 * Automatically falls back to internal graph engine if Python service is unavailable.
 */
async function analyzeRoutesAsync(originId, destinationId) {
  const locationsList = db.prepare(`SELECT * FROM locations`).all();
  const locationsMap = new Map();
  const nameToNode = new Map();
  locationsList.forEach(loc => {
    locationsMap.set(loc.id, loc);
    nameToNode.set(loc.name, loc);
    if (loc.name) {
      nameToNode.set(loc.name.toLowerCase().trim(), loc);
    }
  });

  const originLoc = locationsMap.get(originId);
  const destLoc = locationsMap.get(destinationId);

  if (!originLoc || !destLoc) {
    throw new Error('Invalid origin or destination location ID');
  }

  if (!isNerCoordinate(originLoc.latitude, originLoc.longitude) || !isNerCoordinate(destLoc.latitude, destLoc.longitude)) {
    throw new Error('Selected origin or destination is outside valid North East Region coordinates');
  }

  try {
    const aiUrl = process.env.AI_ENGINE_URL || 'http://127.0.0.1:5001/api/v1/ai/analyze';
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: originLoc.name, destination: destLoc.name }),
      signal: AbortSignal.timeout(20000)
    });

    if (response.ok) {
      const aiData = await response.json();
      if (aiData && aiData.success && aiData.data) {
        const formatAiRoute = (r, mode) => {
          if (!r) return null;

          let rawNodes = [];
          if (Array.isArray(r.pathNodes) && r.pathNodes.length > 0) {
            rawNodes = r.pathNodes.map(pn => {
              const matchedNode = nameToNode.get(pn.name) || nameToNode.get(pn.name?.toLowerCase()?.trim()) || {};
              const lat = Number(pn.latitude ?? pn.lat ?? matchedNode.latitude);
              const lng = Number(pn.longitude ?? pn.lng ?? matchedNode.longitude);
              return {
                id: matchedNode.id || pn.id || pn.name,
                name: pn.name,
                district: pn.district || matchedNode.district || '',
                state: pn.state || matchedNode.state || '',
                lat,
                lng,
                type: pn.location_type || matchedNode.location_type || 'hub',
                is_urban: pn.is_urban ?? matchedNode.is_urban ?? 0,
                risk_score: pn.risk_score ?? matchedNode.risk_score ?? 0.1
              };
            });
          } else if (Array.isArray(r.nodes_in_path) && r.nodes_in_path.length > 0) {
            rawNodes = r.nodes_in_path.map(name => {
              const node = nameToNode.get(name) || nameToNode.get(name?.toLowerCase()?.trim()) || {};
              return {
                id: node.id || name,
                name: name,
                district: node.district || '',
                state: node.state || '',
                lat: Number(node.latitude),
                lng: Number(node.longitude),
                type: node.location_type || 'hub',
                is_urban: node.is_urban ?? 0,
                risk_score: node.risk_score ?? 0.1
              };
            });
          }

          // Strict filter: Eliminate Null Island (0, 0) and non-NER coordinates
          const pathNodes = rawNodes.filter(n => isNerCoordinate(n.lat, n.lng));

          if (pathNodes.length < 2) {
            return null;
          }

          const pathSegments = (r.corridors || []).map(c => ({
            highway: c.highway,
            from: c.origin,
            to: c.destination,
            distanceKm: c.distance_km,
            transitTimeMin: c.effective_time_min || c.base_time_min,
            terrain: c.terrain || 'plain',
            riskScore: c.disaster_risk_score || 0,
            severityBand: (c.disaster_risk_score >= 0.75) ? 'Critical' : (c.disaster_risk_score >= 0.50 ? 'High' : (c.disaster_risk_score >= 0.25 ? 'Moderate' : 'Low')),
            predicted_state: c.predicted_state || 'CLEAR',
            telemetry: c.telemetry || null
          }));

          // Sanitize refueling stations
          const sanitizedRefueling = (r.refueling_stations || []).filter(st => isNerCoordinate(st.latitude, st.longitude));

          return {
            mode: mode,
            origin: originLoc,
            destination: destLoc,
            totalDistanceKm: r.total_distance_km,
            totalTransitTimeMin: r.estimated_transit_time_min,
            averageRiskScore: r.average_disaster_risk,
            severityBand: r.overall_severity,
            nodesCount: pathNodes.length,
            pathNodes: pathNodes,
            pathSegments: pathSegments,
            hazardsEncountered: pathSegments.filter(s => s.riskScore > 0.35 || s.predicted_state !== 'CLEAR').map(s => ({
              highway: s.highway,
              segment: `${s.from} -> ${s.to}`,
              disruption: { type: s.predicted_state, severity: s.severityBand, description: `Live Telemetry: ${s.telemetry?.weather_source || 'Live'} & ${s.telemetry?.traffic_source || 'Live'}` }
            })),
            refueling_stations: sanitizedRefueling,
            refueling_stations_count: sanitizedRefueling.length,
            is_lane_buffered: !!r.is_lane_buffered,
            buffer_status_tag: r.buffer_status_tag || (r.is_lane_buffered ? 'Primary Arterial Corridor — Alternate Lane Buffer Applied' : null),
            isRealTimeAI: true
          };
        };

        const fastestRoute = formatAiRoute(aiData.data.fastestRoute, 'fastest');
        const safestRoute = formatAiRoute(aiData.data.safestRoute, 'safest');

        if (fastestRoute || safestRoute) {
          return {
            fastestRoute,
            safestRoute,
            recommendation: (aiData.data.recommendation || 'Routes computed with real-time AI models.') + ' (Powered by Live Open-Meteo & TomTom AI Engine)',
            aiEngineStatus: 'LIVE_CONNECTED'
          };
        }
      }
    }
  } catch (err) {
    console.warn('[ROUTING] AI Engine microservice fallback to local SQLite graph:', err.message);
  }

  // Fallback to local synchronous Dijkstra/A* graph
  return analyzeRoutes(originId, destinationId);
}

async function findPathAsync(originId, destinationId, mode = 'safest') {
  const analysis = await analyzeRoutesAsync(originId, destinationId);
  return mode === 'fastest' ? analysis.fastestRoute : analysis.safestRoute;
}

module.exports = {
  buildGraph,
  findPath,
  findPathAsync,
  analyzeRoutes,
  analyzeRoutesAsync,
  isNerCoordinate
};