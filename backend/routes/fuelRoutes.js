const express = require('express');
const router = express.Router();

const {
  createFuel,
  getFuelEntries,
  getFuelByVehicle,
  getFuelByTrip,
  updateFuel,
  deleteFuel
} = require('../controllers/fuelController');


// ✅ CREATE + GET ALL
router.route('/')
  .post(createFuel)
  .get(getFuelEntries);


// ✅ FILTER ROUTES
router.get('/vehicle/:vehicleId', getFuelByVehicle);
router.get('/trip/:tripId', getFuelByTrip);


// ✅ UPDATE + DELETE
router.put('/:id', updateFuel);
router.delete('/:id', deleteFuel);


module.exports = router;