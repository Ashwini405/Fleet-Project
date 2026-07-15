const express = require('express');
const { getMaintenanceAlerts, getKpis, getVehicleSummary } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/maintenance-alerts', getMaintenanceAlerts);
router.get('/kpis', verifyToken, getKpis);
router.get('/vehicle-summary/:id', verifyToken, getVehicleSummary);

module.exports = router;
