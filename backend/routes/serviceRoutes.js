const express = require('express');
const router = express.Router();

const serviceController = require('../controllers/serviceController');
const upload = require('../config/multer');

// ✅ CREATE
router.post('/', upload.array('files'), serviceController.createService);

// ✅ GET ALL
router.get('/', serviceController.getAllServices);

// ✅ GET BY VEHICLE
router.get('/vehicle/:vehicleId', serviceController.getByVehicle);
router.get('/:id', serviceController.getServiceById);

module.exports = router;