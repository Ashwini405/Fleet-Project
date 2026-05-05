const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const {
  createRepair,
  getAllRepairs,
  getRepairById,
  getRepairsByVehicle,
  updateRepair,
  deleteRepair
} = require('../controllers/repairController');

// ✅ ROUTES
router.post('/', upload.array('files'), createRepair);
router.get('/', getAllRepairs);
router.get('/vehicle/:vehicleId', getRepairsByVehicle);
router.get('/:id', getRepairById);
router.put('/:id', updateRepair);
router.delete('/:id', deleteRepair);

module.exports = router;