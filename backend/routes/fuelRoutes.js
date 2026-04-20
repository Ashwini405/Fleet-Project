const express = require('express');
const router = express.Router();

const {
  createFuel,
  getFuelEntries,
  getFuelByVehicle,
  getFuelByTrip
} = require('../controllers/fuelController');


// ✅ MAIN ROUTES
router.route('/')
  .post(createFuel)
  .get(getFuelEntries);

// ✅ FILTER ROUTES
router.get('/vehicle/:vehicleId', getFuelByVehicle);
router.get('/trip/:tripId', getFuelByTrip);

module.exports = router;