const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const upload = require('../config/multer');
const { protect } = require('../middleware/permissionMiddleware');

router.get('/alerts', ...protect('Maintenance', 'view'), serviceController.getServiceAlerts);
router.get('/vehicle-status/:vehicleId', ...protect('Maintenance', 'view'), serviceController.getVehicleServiceStatus);
router.post('/', ...protect('Maintenance', 'create'), upload.array('files'), serviceController.createService);
router.get('/', ...protect('Maintenance', 'view'), serviceController.getAllServices);
router.get('/vehicle/:vehicleId', ...protect('Maintenance', 'view'), serviceController.getByVehicle);
router.get('/:id', ...protect('Maintenance', 'view'), serviceController.getServiceById);
router.put('/:id', ...protect('Maintenance', 'edit'), upload.array('files'), serviceController.updateService);

module.exports = router;
