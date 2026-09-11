const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/pendingPurchaseOrderController');

router.get('/',                      controller.getAll);
router.post('/',                     controller.create);
router.get('/:id',                   controller.getById);
router.put('/:id',                   controller.update);
router.delete('/:id',                controller.remove);
router.post('/:id/receive-stock',    controller.receiveStock);

module.exports = router;
