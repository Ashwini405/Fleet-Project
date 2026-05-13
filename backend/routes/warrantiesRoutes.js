const express = require('express');

const router = express.Router();

const upload = require('../config/multer');


const {

  createWarranty,
  getWarranties,
  getWarrantyById

} = require('../controllers/warrantyController');


// ======================================================
// CREATE WARRANTY
// ======================================================

router.post(

  '/',

  upload.fields([

    {

      name: 'warranty_card',
      maxCount: 1

    },

    {

      name: 'invoice_file',
      maxCount: 1

    },

    {

      name: 'additional_documents',
      maxCount: 10

    }

  ]),

  createWarranty

);


// ======================================================
// GET ALL WARRANTIES
// ======================================================

router.get(

  '/',

  getWarranties

);


// ======================================================
// GET WARRANTY BY ID
// ======================================================

router.get(

  '/:id',

  getWarrantyById

);


module.exports = router;