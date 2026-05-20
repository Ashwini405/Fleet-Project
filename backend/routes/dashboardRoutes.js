const express = require('express');
const { getMaintenanceAlerts } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/maintenance-alerts', getMaintenanceAlerts);

module.exports = router;
