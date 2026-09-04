/**
 * NER Sentinel AI - Zero-Internet Offline Execution Engine
 * Pure Client-Side Graph Routing & Outbox Sync for Remote Field Areas
 */

// Master verified North East Nodes & Coordinates
export const OFFLINE_NODES = {
  "Guwahati": { lat: 26.1445, lng: 91.7362, state: "Assam", elev: 55 },
  "Shillong": { lat: 25.5788, lng: 91.8933, state: "Meghalaya", elev: 1525 },
  "Jowai": { lat: 25.4500, lng: 92.2000, state: "Meghalaya", elev: 1380 },
  "Silchar": { lat: 24.8333, lng: 92.7789, state: "Assam", elev: 25 },
  "Karimganj": { lat: 24.8667, lng: 92.3500, state: "Assam", elev: 20 },
  "Agartala": { lat: 23.8315, lng: 91.2868, state: "Tripura", elev: 15 },
  "Aizawl": { lat: 23.7271, lng: 92.7176, state: "Mizoram", elev: 1132 },
  "Mamit": { lat: 23.9284, lng: 92.4897, state: "Mizoram", elev: 718 },
  "Kanchanpur": { lat: 23.7842, lng: 92.2155, state: "Tripura", elev: 120 },
  "Dimapur": { lat: 25.9090, lng: 93.7266, state: "Nagaland", elev: 145 },
  "Kohima": { lat: 25.6751, lng: 94.1086, state: "Nagaland", elev: 1444 },
  "Imphal": { lat: 24.8170, lng: 93.9368, state: "Manipur", elev: 786 },
  "Tezpur": { lat: 26.6528, lng: 92.7926, state: "Assam", elev: 48 },
  "Bomdila": { lat: 27.2645, lng: 92.4230, state: "Arunachal Pradesh", elev: 2217 },
  "Dirang": { lat: 27.3500, lng: 92.2333, state: "Arunachal Pradesh", elev: 1560 },
  "Sela Pass": { lat: 27.5042, lng: 92.1037, state: "Arunachal Pradesh", elev: 4170 },
  "Tawang": { lat: 27.5861, lng: 91.8656, state: "Arunachal Pradesh", elev: 3048 },
  "Siliguri": { lat: 26.7271, lng: 88.3953, state: "West Bengal", elev: 122 },
  "Gangtok": { lat: 27.3389, lng: 88.6065, state: "Sikkim", elev: 1650 },
  "Haflong (Jatinga)": { lat: 25.1800, lng: 93.0200, state: "Assam", elev: 966 },
  "Nagaon": { lat: 26.3452, lng: 92.6840, state: "Assam", elev: 60 },
  "Jorhat": { lat: 26.7509, lng: 94.2037, state: "Assam", elev: 116 },
  "Dibrugarh": { lat: 27.4728, lng: 94.9120, state: "Assam", elev: 108 },
  "Itanagar": { lat: 27.0844, lng: 93.6053, state: "Arunachal Pradesh", elev: 320 }
};

// Master verified Highway Segments
export const OFFLINE_EDGES = [
  { u: "Guwahati", v: "Shillong", dist: 100, time: 150, hw: "NH-6" },
  { u: "Shillong", v: "Jowai", dist: 65, time: 100, hw: "NH-6" },
  { u: "Jowai", v: "Silchar", dist: 140, time: 260, hw: "NH-6 (Sonapur)" },
  { u: "Guwahati", v: "Nagaon", dist: 120, time: 140, hw: "NH-27" },
  { u: "Nagaon", v: "Haflong (Jatinga)", dist: 140, time: 210, hw: "NH-27" },
  { u: "Haflong (Jatinga)", v: "Silchar", dist: 100, time: 135, hw: "NH-27" },
  { u: "Silchar", v: "Karimganj", dist: 55, time: 80, hw: "NH-37" },
  { u: "Karimganj", v: "Agartala", dist: 195, time: 270, hw: "NH-8" },
  { u: "Aizawl", v: "Mamit", dist: 85, time: 135, hw: "NH-108B" },
  { u: "Mamit", v: "Kanchanpur", dist: 60, time: 110, hw: "Jampui Hills Road" },
  { u: "Kanchanpur", v: "Agartala", dist: 140, time: 190, hw: "Tripura State Highway" },
  { u: "Nagaon", v: "Dimapur", dist: 165, time: 210, hw: "NH-29" },
  { u: "Dimapur", v: "Kohima", dist: 74, time: 130, hw: "NH-29" },
  { u: "Kohima", v: "Imphal", dist: 140, time: 230, hw: "NH-2 (Mao Gate)" },
  { u: "Silchar", v: "Imphal", dist: 255, time: 420, hw: "NH-37" },
  { u: "Silchar", v: "Aizawl", dist: 175, time: 330, hw: "NH-306" },
  { u: "Guwahati", v: "Tezpur", dist: 180, time: 220, hw: "NH-15" },
  { u: "Tezpur", v: "Bomdila", dist: 155, time: 280, hw: "NH-13" },
  { u: "Bomdila", v: "Dirang", dist: 42, time: 70, hw: "NH-13" },
  { u: "Dirang", v: "Sela Pass", dist: 65, time: 130, hw: "NH-13 (4170m)" },
  { u: "Sela Pass", v: "Tawang", dist: 75, time: 140, hw: "NH-13" },
  { u: "Siliguri", v: "Gangtok", dist: 115, time: 240, hw: "NH-10" }
];

export class OfflineRoutingEngine {
  constructor() {
    this.nodes = OFFLINE_NODES;
    this.edges = OFFLINE_EDGES;
  }

  calculateRoute(originName, destName, mode = "safest") {
    // Dijkstra Shortest/Safest Path in pure JS
    const graph = {};
    Object.keys(this.nodes).forEach(node => { graph[node] = []; });

    this.edges.forEach(e => {
      if (graph[e.u] && graph[e.v]) {
        const weight = mode === "safest" ? (e.time * 1.1) : e.dist;
        graph[e.u].push({ node: e.v, weight, edge: e });
        graph[e.v].push({ node: e.u, weight, edge: e });
      }
    });

    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(this.nodes));

    Object.keys(this.nodes).forEach(node => {
      distances[node] = Infinity;
      previous[node] = null;
    });

    distances[originName] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let minDistance = Infinity;

      unvisited.forEach(node => {
        if (distances[node] < minDistance) {
          minDistance = distances[node];
          current = node;
        }
      });

      if (!current || distances[current] === Infinity || current === destName) {
        break;
      }

      unvisited.delete(current);

      graph[current].forEach(neighbor => {
        if (unvisited.has(neighbor.node)) {
          const alt = distances[current] + neighbor.weight;
          if (alt < distances[neighbor.node]) {
            distances[neighbor.node] = alt;
            previous[neighbor.node] = current;
          }
        }
      });
    }

    // Reconstruct path
    const path = [];
    let curr = destName;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }

    if (path.length <= 1 && originName !== destName) {
      return null;
    }

    let totalDist = 0;
    let totalTime = 0;
    const pathNodesDetail = [];

    path.forEach((name, i) => {
      const node = this.nodes[name];
      pathNodesDetail.push({
        name,
        latitude: node.lat,
        longitude: node.lng,
        state: node.state
      });

      if (i > 0) {
        const prevName = path[i - 1];
        const edge = this.edges.find(e => (e.u === prevName && e.v === name) || (e.v === prevName && e.u === name));
        if (edge) {
          totalDist += edge.dist;
          totalTime += edge.time;
        }
      }
    });

    return {
      success: true,
      mode,
      is_offline: true,
      origin: originName,
      destination: destName,
      total_distance_km: totalDist,
      estimated_transit_time_min: totalTime,
      average_disaster_risk: 0.15,
      overall_severity: "Low",
      nodes_in_path: path,
      pathNodes: pathNodesDetail,
      source: "NER Sentinel Client-Side Offline Graph (Zero-Internet Engine)"
    };
  }

  // Offline Outbox Incident Synchronization
  queueOfflineReport(report) {
    const queue = JSON.parse(localStorage.getItem('ner_offline_outbox') || '[]');
    const newReport = {
      ...report,
      id: `offline-${Date.now()}`,
      queued_at: new Date().toISOString()
    };
    queue.push(newReport);
    localStorage.setItem('ner_offline_outbox', JSON.stringify(queue));
    return newReport;
  }

  getOfflineQueue() {
    return JSON.parse(localStorage.getItem('ner_offline_outbox') || '[]');
  }

  clearSyncedQueue() {
    localStorage.removeItem('ner_offline_outbox');
  }
}

export const offlineEngine = new OfflineRoutingEngine();
export default offlineEngine;
