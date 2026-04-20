const express = require('express');
const router = express.Router();

const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleByNumber   // ✅ ADD THIS
} = require('../controllers/vehicleController');

router.route('/')
  .get(getVehicles)
  .post(createVehicle);

// ✅ ADD HERE (BEFORE :id)
router.get('/by-number/:vehicle_no', getVehicleByNumber);

router.route('/:id')
  .get(getVehicleById)
  .put(updateVehicle)
  .delete(deleteVehicle);

module.exports = router;