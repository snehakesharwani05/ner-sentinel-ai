export const API_BASE_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return json;
  } catch (err) {
    console.error(`[API ERROR] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  getHealth: () => request('/health'),
  getLocations: () => request('/api/v1/locations'),
  getLocationById: (id) => request(`/api/v1/locations/${id}`),
  getNetworkGraph: () => request('/api/v1/locations/network/graph'),
  getDisruptions: (status = 'active') => request(`/api/v1/disruptions?status=${status}`),
  analyzeRoutes: (origin_id, destination_id) => request('/api/v1/routes/analyze', {
    method: 'POST',
    body: JSON.stringify({ origin_id, destination_id })
  }),
  getOptimalRoute: (origin_id, destination_id, mode = 'safest') => request('/api/v1/routes/optimal', {
    method: 'POST',
    body: JSON.stringify({ origin_id, destination_id, mode })
  }),
  simulateHazard: (payload) => request('/api/v1/routes/simulate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getWeather: () => request('/api/v1/weather'),
  getShipments: () => request('/api/v1/shipments'),
  reportDisruption: (payload, token) => request('/api/v1/disruptions', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: JSON.stringify(payload)
  }),
  updateDisruptionStatus: (id, status, token) => request(`/api/v1/disruptions/${id}/status`, {
    method: 'PATCH',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: JSON.stringify({ status })
  }),
  getConvoys: (commodity = 'ALL') => request(`/api/v1/convoys?commodity=${commodity}`),
  getConvoyById: (id) => request(`/api/v1/convoys/${id}`),
  triggerConvoyReroute: (id, blocked_edge_id) => request(`/api/v1/convoys/trigger-reroute/${id}`, {
    method: 'POST',
    body: JSON.stringify({ blocked_edge_id })
  }),
  pingConvoy: (payload) => request('/api/v1/convoys/ping', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
