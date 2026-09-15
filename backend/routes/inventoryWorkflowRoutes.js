const express = require('express');
const controller = require('../controllers/inventoryWorkflowController');

const router = express.Router();

router.post('/requests', controller.createRequest);
router.get('/requests', controller.getRequests);
router.get('/vendors', controller.getVendors);
router.post('/purchase-orders', controller.createPurchaseOrder);
router.put('/purchase-orders/:id/:action', controller.transitionPurchaseOrder);
router.post('/purchase-orders/:id/receive', controller.receivePurchaseOrder);
router.post('/issues', controller.issuePart);
router.post('/vehicle-inventory/:id/remove', controller.removePart);
router.post('/vehicle-inventory/:id/replace', controller.replacePart);
router.post('/vehicle-inventory/:id/lifecycle', controller.addLifecycleEvent);
router.get('/movements', controller.list('inventory_stock_movements'));
router.get('/dispositions', controller.list('inventory_dispositions'));
router.get('/costs', controller.list('inventory_cost_entries'));
router.get('/lifecycle', controller.list('vehicle_inventory_lifecycle_events'));
router.get('/reports', controller.getReports);

module.exports = router;
