const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vehicleInventoryController');

router.get('/parts',                    ctrl.getInventoryParts);
router.get('/:vehicleNumber',           ctrl.getByVehicleNumber);
router.post('/:id/return',             ctrl.returnPart);
router.post('/:id/replace',            ctrl.replacePart);
router.put('/:id/condition',           ctrl.updateCondition);
router.delete('/:id/remove',           ctrl.removeAssignment);

module.exports = router;
