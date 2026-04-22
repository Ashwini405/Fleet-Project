const express = require('express');
const router = express.Router();

const upload = require('../config/multer'); // ✅ multer

const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleByNumber,
  uploadDocument,
  checkAvailability
} = require('../controllers/vehicleController');


// 🔥 NEW ROUTE (DOCUMENT UPLOAD FROM MODAL)
router.post(
  '/upload-document',
  upload.single('file'),
  uploadDocument
);


// ✅ CREATE VEHICLE (WITH FILE UPLOAD)
router.post(
  '/',
  upload.fields([
    { name: 'insurance_document' },
    { name: 'fc_document' },
    { name: 'permit_document' },
    { name: 'tax_document' },
    { name: 'pollution_document' },
    { name: 'cll_document' },
    { name: 'rc_document' }
  ]),
  createVehicle
);


// ✅ GET ALL VEHICLES
router.get('/', getVehicles);


// ✅ GET BY VEHICLE NUMBER
router.get('/by-number/:vehicle_no', getVehicleByNumber);

// ✅ CHECK VEHICLE AVAILABILITY
router.get('/availability/:vehicle_no', checkAvailability);


// ✅ GET SINGLE VEHICLE
router.get('/:id', getVehicleById);


// ✅ UPDATE VEHICLE (WITH FILE UPLOAD)
router.put(
  '/:id',
  upload.fields([
    { name: 'insurance_document' },
    { name: 'fc_document' },
    { name: 'permit_document' },
    { name: 'tax_document' },
    { name: 'pollution_document' },
    { name: 'cll_document' },
    { name: 'rc_document' }
  ]),
  updateVehicle
);


// ✅ DELETE VEHICLE
router.delete('/:id', deleteVehicle);

module.exports = router;