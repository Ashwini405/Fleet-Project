const express = require('express');

const router = express.Router();

const controller =
require('../controllers/driverController');

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

module.exports = router;