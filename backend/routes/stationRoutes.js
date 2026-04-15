const express = require('express');
const router = express.Router();
const controller = require('../controllers/stationController');

// Create station
router.post('/', controller.createStation);

// Get all stations
router.get('/', controller.getStations);

router.delete('/:id', controller.deleteStation);
router.put('/:id', controller.updateStation);

module.exports = router;