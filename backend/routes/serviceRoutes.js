const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const upload = require('../config/multer');

router.get('/alerts', serviceController.getServiceAlerts);
router.get('/vehicle-status/:vehicleId', serviceController.getVehicleServiceStatus);
router.post('/', upload.array('files'), serviceController.createService);
router.get('/', serviceController.getAllServices);
router.get('/vehicle/:vehicleId', serviceController.getByVehicle);
router.get('/:id', serviceController.getServiceById);
router.put('/:id', upload.array('files'), serviceController.updateService);

module.exports = router;
