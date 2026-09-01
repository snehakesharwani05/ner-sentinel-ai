const db = require('../config/db');
const { analyzeRoutes } = require('./routingService');

function generateTrackingCode(prefix = 'NER') {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomNum}`;
}

function createShipment(data) {
  const { origin_location_id, destination_location_id, cargo_type, priority, weight_kg } = data;

  if (!origin_location_id || !destination_location_id || !cargo_type || !weight_kg) {
    throw new Error('Missing required shipment parameters');
  }

  // Analyze route to assign optimal route
  const routeAnalysis = analyzeRoutes(Number(origin_location_id), Number(destination_location_id));
  const assignedRoute = routeAnalysis.safestRoute || routeAnalysis.fastestRoute;

  const trackingCode = generateTrackingCode(cargo_type.slice(0, 3).toUpperCase());

  const stmt = db.prepare(`
    INSERT INTO shipments (tracking_code, origin_location_id, destination_location_id, cargo_type, priority, weight_kg, status, assigned_route_json)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `);

  stmt.run(
    trackingCode,
    origin_location_id,
    destination_location_id,
    cargo_type,
    priority || 'normal',
    weight_kg,
    assignedRoute ? JSON.stringify(assignedRoute) : null
  );

  return getShipmentByTrackingCode(trackingCode);
}

function getShipmentByTrackingCode(trackingCode) {
  const shipment = db.prepare(`
    SELECT s.*, 
           o.name as origin_name, o.state as origin_state,
           d.name as destination_name, d.state as destination_state
    FROM shipments s
    JOIN locations o ON s.origin_location_id = o.id
    JOIN locations d ON s.destination_location_id = d.id
    WHERE s.tracking_code = ?
  `).get(trackingCode);

  if (shipment && shipment.assigned_route_json) {
    try {
      shipment.assigned_route = JSON.parse(shipment.assigned_route_json);
    } catch (e) {
      shipment.assigned_route = null;
    }
  }

  return shipment;
}

function getAllShipments() {
  const shipments = db.prepare(`
    SELECT s.*, 
           o.name as origin_name, o.state as origin_state,
           d.name as destination_name, d.state as destination_state
    FROM shipments s
    JOIN locations o ON s.origin_location_id = o.id
    JOIN locations d ON s.destination_location_id = d.id
    ORDER BY s.created_at DESC
  `).all();

  shipments.forEach(s => {
    if (s.assigned_route_json) {
      try {
        s.assigned_route = JSON.parse(s.assigned_route_json);
      } catch (e) {
        s.assigned_route = null;
      }
    }
  });

  return shipments;
}

function updateShipmentStatus(id, status) {
  const validStatuses = ['pending', 'dispatched', 'in_transit', 'delivered', 'rerouted'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid shipment status');
  }

  const dispatchedAt = status === 'dispatched' ? new Date().toISOString() : null;

  if (dispatchedAt) {
    db.prepare(`UPDATE shipments SET status = ?, dispatched_at = ? WHERE id = ?`).run(status, dispatchedAt, id);
  } else {
    db.prepare(`UPDATE shipments SET status = ? WHERE id = ?`).run(status, id);
  }

  return db.prepare(`SELECT * FROM shipments WHERE id = ?`).get(id);
}

module.exports = {
  createShipment,
  getShipmentByTrackingCode,
  getAllShipments,
  updateShipmentStatus
};
