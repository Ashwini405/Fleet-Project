const express = require('express');
const router = express.Router();
const controller = require('../controllers/driverController');

// ROUTES
router.post('/', controller.createDriver);
router.get('/', controller.getDrivers);
router.delete('/:id', controller.deleteDriver);

module.exports = router;