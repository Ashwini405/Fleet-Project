const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

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
  .post(upload.array('receipt_files', 10), createFuel)
  .get(getFuelEntries);


// ✅ FILTER ROUTES
router.get('/vehicle/:vehicleId', getFuelByVehicle);
router.get('/trip/:tripId', getFuelByTrip);


// ✅ UPDATE + DELETE
router.put('/:id', upload.array('receipt_files', 10), updateFuel);
router.delete('/:id', deleteFuel);


module.exports = router;