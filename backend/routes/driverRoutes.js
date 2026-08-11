const express = require('express');

const router = express.Router();

const controller =
require('../controllers/driverController');

const advanceController =
require('../controllers/driverAdvanceController');

const upload =
require('../config/multer');

// ================= CREATE DRIVER =================
router.post(
  '/',
  upload.fields([
    {
      name: 'profile_photo',
      maxCount: 1
    },
    {
      name: 'id_proof',
      maxCount: 1
    },
    {
      name: 'bank_document',
      maxCount: 1
    }
  ]),
  controller.createDriver
);

// ================= UPDATE DRIVER =================
router.put(
  '/:id',
  upload.fields([
    {
      name: 'profile_photo',
      maxCount: 1
    },
    {
      name: 'id_proof',
      maxCount: 1
    },
    {
      name: 'bank_document',
      maxCount: 1
    }
  ]),
  controller.updateDriver
);

// ================= GET ALL DRIVERS =================
router.get(
  '/',
  controller.getDrivers
);

// ================= DRIVER PROFILE =================
router.get(
  '/profile/:id',
  controller.getDriverProfile
);

// ================= DELETE DRIVER =================
router.delete(
  '/:id',
  controller.deleteDriver
);

// ================= DRIVER ADVANCES =================
router.post(
  '/:id/advances',
  advanceController.createAdvance
);

router.get(
  '/:id/advances',
  advanceController.getDriverAdvances
);

router.delete(
  '/:id/advances/:advanceId',
  advanceController.deleteAdvance
);

module.exports = router;