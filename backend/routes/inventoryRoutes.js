const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');

const multer = require('multer');
const path = require('path');


// ✅ STORAGE
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
      '-' +
      Math.round(Math.random() * 1E9) +
      path.extname(file.originalname)
    );
  }
});


// ✅ FILE FILTER
const fileFilter = (req, file, cb) => {

  cb(null, true);
};


// ✅ UPLOAD
const upload = multer({
  storage,
  fileFilter
});


// ✅ MULTIPLE FILES
const uploadFields = upload.fields([
  { name: 'part_image', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]);


// ======================================================
// ✅ INVENTORY ROUTES
// ======================================================


// ✅ CREATE PART
router.post(
  '/',
  uploadFields,
  inventoryController.createPart
);


// ✅ GET ALL PARTS
router.get(
  '/',
  inventoryController.getAllParts
);


// ✅ GET PART BY ID



// ✅ UPDATE PART
router.put(
  '/:id',
  uploadFields,
  inventoryController.updatePart
);


// ✅ DELETE PART
router.delete(
  '/:id',
  inventoryController.deletePart
);


// ======================================================
// ✅ STOCK IN ROUTE (NEW)
// ======================================================

router.post(
  '/stock-in',
  inventoryController.stockInPart
);

router.post(
  '/stock-out',
  inventoryController.stockOutPart
);

router.get(
  '/movement-history',
  inventoryController.getMovementHistory
);

router.get(
  '/issue-history',
  inventoryController.getIssueHistory
);



// ======================================================
// ✅ PURCHASE ORDER ROUTES
// ======================================================

// GET ALL PURCHASE ORDERS
router.get(
  '/purchase-orders',
  inventoryController.getPurchaseOrders
);


// APPROVE PURCHASE ORDER
router.put(
  '/purchase-orders/:id/approve',
  inventoryController.approvePurchaseOrder
);


// REJECT PURCHASE ORDER
router.put(
  '/purchase-orders/:id/reject',
  inventoryController.rejectPurchaseOrder
);


// RECEIVE PURCHASE ORDER
router.put(
  '/purchase-orders/:id/receive',
  inventoryController.receivePurchaseOrder
);

// ======================================================
// ✅ VENDOR ROUTES
// ======================================================


// ✅ GET ALL VENDORS
router.get(
  '/vendors',
  inventoryController.getVendors
);


// ✅ CREATE VENDOR
router.post(
  '/vendors',
  inventoryController.createVendor
);


// ======================================================
// ✅ WAREHOUSE ROUTES
// ======================================================


// ✅ GET ALL WAREHOUSES
router.get(
  '/warehouses',
  inventoryController.getWarehouses
);


// ✅ CREATE WAREHOUSE
router.post(
  '/warehouses',
  inventoryController.createWarehouse
);

router.get(
  '/:id',
  inventoryController.getPartById
);

module.exports = router;