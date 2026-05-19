const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage, fileFilter: (req, file, cb) => cb(null, true) });

const uploadFields = upload.fields([
  { name: 'part_image', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]);


// ======================================================
// SPECIFIC NAMED ROUTES  (must come before /:id wildcards)
// ======================================================

// Stock movements
router.post('/stock-in',          inventoryController.stockInPart);
router.post('/stock-out',         inventoryController.stockOutPart);
router.get('/movement-history',   inventoryController.getMovementHistory);
router.get('/issue-history',      inventoryController.getIssueHistory);

// Purchase orders
router.get('/purchase-orders',                    inventoryController.getPurchaseOrders);
router.post('/purchase-orders',                   inventoryController.createPurchaseOrder);
router.put('/purchase-orders/:id/hold',          inventoryController.holdPurchaseOrder);
router.put('/purchase-orders/:id/order',   inventoryController.orderPurchaseOrder);
router.put('/purchase-orders/:id/approve',        inventoryController.approvePurchaseOrder);
router.put('/purchase-orders/:id/reject',         inventoryController.rejectPurchaseOrder);
router.put('/purchase-orders/:id/receive',        inventoryController.receivePurchaseOrder);

// Vendors
router.get('/vendors',   inventoryController.getVendors);
router.post('/vendors',  inventoryController.createVendor);

// Warehouses
router.get('/warehouses',  inventoryController.getWarehouses);
router.post('/warehouses', inventoryController.createWarehouse);


// ======================================================
// GENERIC CRUD  (/:id wildcards — must come LAST)
// ======================================================

router.get('/',    inventoryController.getAllParts);
router.post('/',   uploadFields, inventoryController.createPart);
router.get('/:id', inventoryController.getPartById);
router.put('/:id', uploadFields, inventoryController.updatePart);
router.delete('/:id', inventoryController.deletePart);

module.exports = router;
