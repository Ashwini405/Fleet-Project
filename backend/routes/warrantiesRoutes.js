const express = require('express');
const router  = express.Router();
const upload  = require('../config/multer');

const {
  createWarranty,
  updateWarranty,
  getWarranties,
  getWarrantyById
} = require('../controllers/warrantyController');

const fileFields = upload.fields([
  { name: 'warranty_card',        maxCount: 1  },
  { name: 'invoice_file',         maxCount: 1  },
  { name: 'additional_documents', maxCount: 10 },
]);

router.post('/',     fileFields, createWarranty);
router.put('/:id',  fileFields, updateWarranty);
router.get('/',     getWarranties);
router.get('/:id',  getWarrantyById);

module.exports = router;