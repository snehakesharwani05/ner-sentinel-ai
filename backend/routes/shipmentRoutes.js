const express = require('express');
const router = express.Router();
const shipmentService = require('../services/shipmentService');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

// GET /api/v1/shipments - list all shipments (Public/Operator)
router.get('/', (req, res, next) => {
  try {
    const shipments = shipmentService.getAllShipments();
    res.json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/shipments/:trackingCode - track shipment (Public)
router.get('/:trackingCode', (req, res, next) => {
  try {
    const shipment = shipmentService.getShipmentByTrackingCode(req.params.trackingCode);

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment tracking code not found' });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/shipments - create/dispatch new shipment (Requires admin, operator, or disaster_mgmt)
router.post('/', authenticateToken, requireRoles('admin', 'operator', 'disaster_mgmt'), (req, res, next) => {
  try {
    const { origin_location_id, destination_location_id, cargo_type, priority, weight_kg } = req.body;

    const shipment = shipmentService.createShipment({
      origin_location_id,
      destination_location_id,
      cargo_type,
      priority,
      weight_kg
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created and optimal hazard-mitigated route assigned successfully.',
      data: shipment
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/shipments/:id/status - update shipment status (Requires admin, operator, disaster_mgmt, or driver)
router.patch('/:id/status', authenticateToken, requireRoles('admin', 'operator', 'disaster_mgmt', 'driver'), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = shipmentService.updateShipmentStatus(id, status);
    res.json({
      success: true,
      message: `Shipment status updated to '${status}'`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
