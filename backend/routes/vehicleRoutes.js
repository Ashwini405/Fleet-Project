const express = require('express');
const router = express.Router();

const upload = require('../config/multer');
const { protect } = require('../middleware/permissionMiddleware');

const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleByNumber,
  uploadDocument,
  checkAvailability,
  getVehicleHealthScore,
  getVehicleMaintenanceTimeline,
  updateVehicleStatus
} = require('../controllers/vehicleController');


// ===================== DOCUMENT UPLOAD =====================
router.post(
  '/upload-document',
  ...protect('Vehicle Master', 'edit'),
  upload.single('file'),
  uploadDocument
);


// ===================== CREATE VEHICLE =====================
router.post(
  '/',
  ...protect('Vehicle Master', 'create'),
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
router.get('/', ...protect('Vehicle Master', 'view'), getVehicles);


// ===================== GET BY VEHICLE NUMBER =====================
// 🔥 IMPORTANT: This must come BEFORE '/:id'
router.get('/by-number/:vehicle_no', ...protect('Vehicle Master', 'view'), getVehicleByNumber);


// ===================== CHECK AVAILABILITY =====================
router.get('/availability/:vehicle_no', ...protect('Vehicle Master', 'view'), checkAvailability);

// ===================== VEHICLE HEALTH SCORE =====================
router.get('/:id/health', ...protect('Vehicle Master', 'view'), getVehicleHealthScore);

// ===================== MAINTENANCE TIMELINE =====================
router.get('/:id/maintenance-timeline', ...protect('Vehicle Master', 'view'), getVehicleMaintenanceTimeline);

// ===================== UPDATE VEHICLE STATUS (repair / active) =====================
router.patch('/:id/status', ...protect('Vehicle Master', 'edit'), updateVehicleStatus);

// ===================== GET VEHICLE BY ID =====================
router.get('/:id', ...protect('Vehicle Master', 'view'), getVehicleById);


// ===================== UPDATE VEHICLE =====================
router.put(
  '/:id',
  ...protect('Vehicle Master', 'edit'),
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
router.delete('/:id', ...protect('Vehicle Master', 'delete'), deleteVehicle);


module.exports = router;