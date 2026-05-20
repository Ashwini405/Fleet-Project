const express = require('express');
const router = express.Router();
const {
  createInspectionDefect,
  getInspectionDefects,
  getInspectionDefectById,
  updateInspectionDefect,
  createRepairFromInspectionDefect,
  createPeriodicServiceFromInspection,
  getDefectsByVehicle
} = require('../controllers/inspectionDefectController');

router.post('/', createInspectionDefect);
router.get('/', getInspectionDefects);
router.get('/:id', getInspectionDefectById);
router.put('/:id', updateInspectionDefect);
router.post('/:id/create-repair', createRepairFromInspectionDefect);
router.post('/create-service', createPeriodicServiceFromInspection);
router.get('/vehicle/:vehicleId', getDefectsByVehicle);

module.exports = router;
