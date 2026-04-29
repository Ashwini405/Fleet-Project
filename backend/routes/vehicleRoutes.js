const express = require('express');
const router = express.Router();

const upload = require('../config/multer');

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


// ===================== DOCUMENT UPLOAD =====================
router.post(
  '/upload-document',
  upload.single('file'),
  uploadDocument
);


// ===================== CREATE VEHICLE =====================
router.post(
  '/',
  upload.fields([
    { name: 'insurance_document', maxCount: 1 },
    { name: 'fc_document', maxCount: 1 },
    { name: 'permit_document', maxCount: 1 },
    { name: 'tax_document', maxCount: 1 },
    { name: 'pollution_document', maxCount: 1 },
    { name: 'cll_document', maxCount: 1 },
    { name: 'rc_document', maxCount: 1 }
  ]),
  createVehicle
);


// ===================== GET ALL VEHICLES =====================
router.get('/', getVehicles);


// ===================== GET BY VEHICLE NUMBER =====================
// 🔥 IMPORTANT: This must come BEFORE '/:id'
router.get('/by-number/:vehicle_no', getVehicleByNumber);


// ===================== CHECK AVAILABILITY =====================
router.get('/availability/:vehicle_no', checkAvailability);


// ===================== GET VEHICLE BY ID =====================
router.get('/:id', getVehicleById);


// ===================== UPDATE VEHICLE =====================
router.put(
  '/:id',
  upload.fields([
    { name: 'insurance_document', maxCount: 1 },
    { name: 'fc_document', maxCount: 1 },
    { name: 'permit_document', maxCount: 1 },
    { name: 'tax_document', maxCount: 1 },
    { name: 'pollution_document', maxCount: 1 },
    { name: 'cll_document', maxCount: 1 },
    { name: 'rc_document', maxCount: 1 }
  ]),
  updateVehicle
);


// ===================== DELETE VEHICLE =====================
router.delete('/:id', deleteVehicle);


module.exports = router;