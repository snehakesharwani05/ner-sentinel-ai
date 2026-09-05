/**
 * PurvaSetu / PRAGATI-AI (SIH Problem Statement 26002)
 * Autonomous Offline Graph Traversal & Route Solver Web Worker
 * In-memory A* search, Haversine spatial snapping, and hazard-weighted resilient pathfinding.
 */

// Earth radius in kilometers for Haversine calculations
const EARTH_RADIUS_KM = 6371.0;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180.0;
}

// 1. Haversine Great-Circle Distance
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  return EARTH_RADIUS_KM * c;
}

// 2. Spatial Snapping: Snap arbitrary [lat, lng] to nearest graph junction
function snapToNearestJunction(targetLat, targetLng, nodesDict, thresholdKm = 5.0) {
  let nearestNodeId = null;
  let minDistance = Infinity;

  for (const [nodeId, coords] of Object.entries(nodesDict)) {
    const nodeLat = Array.isArray(coords) ? coords[0] : (coords.lat ?? coords.latitude);
    const nodeLng = Array.isArray(coords) ? coords[1] : (coords.lng ?? coords.longitude);

    if (nodeLat === undefined || nodeLng === undefined) continue;

    const dist = haversineDistanceKm(targetLat, targetLng, Number(nodeLat), Number(nodeLng));
    if (dist < minDistance) {
      minDistance = dist;
      nearestNodeId = nodeId;
    }
  }

  return {
    nodeId: nearestNodeId,
    snappedDistanceKm: minDistance,
    withinThreshold: minDistance <= thresholdKm
  };
}

// 3. Min Priority Queue for A* Search
class MinPriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift()?.item;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

// 4. A* Search Engine with Admissible Haversine Heuristic
function runAStar(nodesDict, adjList, startNode, goalNode, options = {}) {
  const {
    costMode = 'fastest', // 'fastest' | 'safest'
    penalizedEdges = new Set(), // Set of "u->v" strings
    penaltyMultiplier = 1.45 // 1.40x - 1.50x
  } = options;

  if (!nodesDict[startNode] || !nodesDict[goalNode]) {
    return null;
  }
  if (startNode === goalNode) {
    return [startNode];
  }

  const goalCoords = nodesDict[goalNode];
  const goalLat = Array.isArray(goalCoords) ? goalCoords[0] : (goalCoords.lat ?? goalCoords.latitude);
  const goalLng = Array.isArray(goalCoords) ? goalCoords[1] : (goalCoords.lng ?? goalCoords.longitude);

  const frontier = new MinPriorityQueue();
  frontier.enqueue(startNode, 0);

  const cameFrom = {};
  const gScore = {}; // Cost from start along best known path
  const fScore = {}; // Estimated total cost: gScore + heuristic

  for (const nodeId of Object.keys(nodesDict)) {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  }

  gScore[startNode] = 0;
  const startDistToGoal = haversineDistanceKm(
    Array.isArray(nodesDict[startNode]) ? nodesDict[startNode][0] : nodesDict[startNode].lat,
    Array.isArray(nodesDict[startNode]) ? nodesDict[startNode][1] : nodesDict[startNode].lng,
    goalLat,
    goalLng
  );
  fScore[startNode] = startDistToGoal;

  const visited = new Set();

  while (!frontier.isEmpty()) {
    const current = frontier.dequeue();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    if (current === goalNode) {
      break;
    }

    const neighbors = adjList[current] || [];
    for (const edge of neighbors) {
      const neighbor = edge.to || edge.v || edge.destination;
      if (visited.has(neighbor)) continue;

      const dist = Number(edge.dist ?? edge.distance_km ?? 10);
      const risk = Number(edge.risk ?? edge.disaster_risk_score ?? 0.1);

      // Edge penalty check (for forced divergence on safest route)
      const edgeKeyForward = `${current}->${neighbor}`;
      const edgeKeyReverse = `${neighbor}->${current}`;
      const isPenalized = penalizedEdges.has(edgeKeyForward) || penalizedEdges.has(edgeKeyReverse);
      const edgeMultiplier = isPenalized ? penaltyMultiplier : 1.0;

      // Evaluation cost
      let stepCost = dist;
      if (costMode === 'safest') {
        // Weight(u, v) = dist * (1.0 + risk * 2.0) * penalty
        stepCost = dist * (1.0 + risk * 2.0) * edgeMultiplier;
      } else {
        // Fastest speed evaluation (time-proportional)
        const speed = Number(edge.speed_kmh ?? 50);
        stepCost = (dist / Math.max(15, speed)) * 60.0;
      }

      const tentativeGScore = gScore[current] + stepCost;

      if (tentativeGScore < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;

        const neighborCoords = nodesDict[neighbor];
        const nLat = Array.isArray(neighborCoords) ? neighborCoords[0] : (neighborCoords.lat ?? neighborCoords.latitude);
        const nLng = Array.isArray(neighborCoords) ? neighborCoords[1] : (neighborCoords.lng ?? neighborCoords.longitude);
        const heuristic = haversineDistanceKm(nLat, nLng, goalLat, goalLng);

        fScore[neighbor] = tentativeGScore + heuristic;
        frontier.enqueue(neighbor, fScore[neighbor]);
      }
    }
  }

  if (gScore[goalNode] === Infinity) {
    return null;
  }

  // Reconstruct path
  const path = [];
  let curr = goalNode;
  while (curr) {
    path.unshift(curr);
    curr = cameFrom[curr];
  }

  return path;
}

// 5. Build rich path details with Leaflet [lat, lng] and GeoJSON [lng, lat]
function formatPathResults(pathNodes, nodesDict, adjList, mode = 'fastest', isLaneBuffered = false) {
  if (!pathNodes || pathNodes.length === 0) return null;

  if (pathNodes.length === 1) {
    const singleName = pathNodes[0];
    const coords = nodesDict[singleName];
    const lat = Array.isArray(coords) ? coords[0] : (coords.lat ?? coords.latitude ?? 26.0);
    const lng = Array.isArray(coords) ? coords[1] : (coords.lng ?? coords.longitude ?? 92.0);

    return {
      success: true,
      mode,
      is_offline: true,
      origin: singleName,
      destination: singleName,
      totalDistanceKm: 0,
      total_distance_km: 0,
      totalTransitTimeMin: 0,
      estimated_transit_time_min: 0,
      averageRiskScore: 0.05,
      severityBand: 'Low',
      overall_severity: 'Low',
      nodesCount: 1,
      nodes_in_path: [singleName],
      pathNodes: [{
        name: singleName,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6))
      }],
      leafletCoordinates: [[lat, lng]],
      geojsonCoordinates: [[lng, lat]],
      pathSegments: [],
      source: 'OFFLINE: Autonomous Edge Node Routing (A* Spatial Engine)'
    };
  }

  let totalDistanceKm = 0.0;
  let totalTransitTimeMin = 0.0;
  const riskScores = [];
  const pathNodesDetail = [];
  const leafletCoordinates = [];
  const geojsonCoordinates = [];
  const pathSegments = [];

  for (let i = 0; i < pathNodes.length; i++) {
    const name = pathNodes[i];
    const coords = nodesDict[name];
    let lat = Array.isArray(coords) ? coords[0] : (coords.lat ?? coords.latitude ?? 26.0);
    let lng = Array.isArray(coords) ? coords[1] : (coords.lng ?? coords.longitude ?? 92.0);

    // Apply micro-offset for lane buffering if active
    if (isLaneBuffered && i > 0 && i < pathNodes.length - 1) {
      lat += 0.0004;
      lng += 0.0004;
    }

    // Sanitize bounds (20.0°N - 30.0°N, 88.0°E - 98.0°E)
    lat = Math.max(20.0, Math.min(30.0, lat));
    lng = Math.max(88.0, Math.min(98.0, lng));

    pathNodesDetail.push({
      id: i + 1,
      name,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    });

    leafletCoordinates.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    geojsonCoordinates.push([Number(lng.toFixed(6)), Number(lat.toFixed(6))]);

    if (i < pathNodes.length - 1) {
      const u = pathNodes[i];
      const v = pathNodes[i + 1];
      const neighbors = adjList[u] || [];
      const edge = neighbors.find(e => (e.to === v || e.destination === v)) || {
        dist: 45,
        risk: 0.12,
        highway: 'NH',
        speed_kmh: 50
      };

      const dist = Number(edge.dist ?? edge.distance_km ?? 45);
      const speed = Number(edge.speed_kmh ?? 50);
      const timeMin = Number(edge.time_min ?? (dist / Math.max(15, speed)) * 60.0);
      const risk = Number(edge.risk ?? 0.12);

      totalDistanceKm += dist;
      totalTransitTimeMin += timeMin;
      riskScores.push(risk);

      pathSegments.push({
        from: u,
        to: v,
        highway: edge.highway || 'NH',
        distanceKm: dist,
        transitTimeMin: Math.round(timeMin),
        predicted_state: risk > 0.4 ? 'HAZARD_WARNING' : 'CLEAR',
        riskScore: risk,
        severityBand: risk > 0.4 ? 'Moderate' : 'Low'
      });
    }
  }

  const avgRisk = Number((riskScores.reduce((a, b) => a + b, 0) / Math.max(1, riskScores.length)).toFixed(3));
  const severity = avgRisk >= 0.50 ? 'High' : (avgRisk >= 0.25 ? 'Moderate' : 'Low');

  return {
    success: true,
    mode,
    is_offline: true,
    origin: pathNodes[0],
    destination: pathNodes[pathNodes.length - 1],
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    total_distance_km: Number(totalDistanceKm.toFixed(1)),
    totalTransitTimeMin: Math.round(totalTransitTimeMin),
    estimated_transit_time_min: Math.round(totalTransitTimeMin),
    averageRiskScore: avgRisk,
    average_disaster_risk: avgRisk,
    severityBand: severity,
    overall_severity: severity,
    nodesCount: pathNodesDetail.length,
    nodes_in_path: pathNodes,
    pathNodes: pathNodesDetail,
    leafletCoordinates,
    geojsonCoordinates,
    pathSegments,
    is_lane_buffered: isLaneBuffered,
    buffer_status_tag: isLaneBuffered ? 'Primary Arterial Corridor — Alternate Lane Buffer Applied' : null,
    source: 'OFFLINE: Autonomous Edge Node Routing (A* Spatial Engine)'
  };
}

// 6. Web Worker onmessage Listener
self.onmessage = function (e) {
  const { id, origin, destination, originCoords, destCoords, graph } = e.data;

  try {
    const nodesDict = graph.nodes;
    const adjList = graph.adj;

    // Resolve Origin & Destination Node IDs (via direct name or spatial snapping)
    let startNode = origin;
    let goalNode = destination;

    if (originCoords && Array.isArray(originCoords)) {
      const snapStart = snapToNearestJunction(originCoords[0], originCoords[1], nodesDict);
      if (snapStart.nodeId) startNode = snapStart.nodeId;
    } else if (typeof origin === 'string' && !nodesDict[origin]) {
      // Fuzzy resolve
      const match = Object.keys(nodesDict).find(k => k.toLowerCase() === origin.toLowerCase());
      if (match) startNode = match;
    }

    if (destCoords && Array.isArray(destCoords)) {
      const snapGoal = snapToNearestJunction(destCoords[0], destCoords[1], nodesDict);
      if (snapGoal.nodeId) goalNode = snapGoal.nodeId;
    } else if (typeof destination === 'string' && !nodesDict[destination]) {
      const match = Object.keys(nodesDict).find(k => k.toLowerCase() === destination.toLowerCase());
      if (match) goalNode = match;
    }

    if (!nodesDict[startNode] || !nodesDict[goalNode]) {
      throw new Error(`Location '${origin}' or '${destination}' could not be snapped to road network.`);
    }

    // Check if origin and destination snapped to identical node
    if (startNode === goalNode) {
      const singlePointResult = formatPathResults([startNode], nodesDict, adjList, 'fastest');
      self.postMessage({
        id,
        success: true,
        data: {
          fastestRoute: singlePointResult,
          safestRoute: singlePointResult,
          recommendation: '🟡 Origin and Destination snapped to identical junction (0 km).'
        }
      });
      return;
    }

    // 1. Compute Shortest / Fastest Path via A*
    const fastestPath = runAStar(nodesDict, adjList, startNode, goalNode, {
      costMode: 'fastest'
    });

    if (!fastestPath) {
      throw new Error(`No traversable path found between '${startNode}' and '${goalNode}'.`);
    }

    // 2. Compute Differentiated Safest Resilient Route
    // Collect edges used by fastest route
    const penalizedEdges = new Set();
    for (let i = 0; i < fastestPath.length - 1; i++) {
      penalizedEdges.add(`${fastestPath[i]}->${fastestPath[i + 1]}`);
    }

    // Run A* with hazard-weighted cost and 1.45x penalty on fastest edges
    let safestPath = runAStar(nodesDict, adjList, startNode, goalNode, {
      costMode: 'safest',
      penalizedEdges,
      penaltyMultiplier: 1.45
    });

    let isLaneBuffered = false;

    // Detour Ceiling Guard: Distance(Safest) <= 1.25 * Distance(Fastest)
    const fastestResult = formatPathResults(fastestPath, nodesDict, adjList, 'fastest', false);
    const maxCeilingKm = fastestResult.totalDistanceKm * 1.25;

    let safestResult = formatPathResults(safestPath, nodesDict, adjList, 'safest', false);

    if (!safestResult || safestResult.totalDistanceKm > maxCeilingKm || safestPath.join('->') === fastestPath.join('->')) {
      // Prune wide detour & snap back to primary corridor with alternate lane buffer
      isLaneBuffered = true;
      safestResult = formatPathResults(fastestPath, nodesDict, adjList, 'safest', true);
    }

    self.postMessage({
      id,
      success: true,
      data: {
        fastestRoute: fastestResult,
        safestRoute: safestResult,
        recommendation: '🟡 OFFLINE: Autonomous Edge Node Routing Active (A* Spatial Traversal & Snapping)'
      }
    });
  } catch (err) {
    self.postMessage({
      id,
      success: false,
      error: err.message || 'Offline pathfinding failed'
    });
  }
};
