const express = require('express');

const router = express.Router();

const upload = require('../config/multer');

const {

  createWarrantyClaim,
  getWarrantyClaims,
  getWarrantyClaimById,
  updateWarrantyClaim

} = require('../controllers/warrantyClaimController');




// ======================================================
// CREATE CLAIM
// ======================================================

router.post(

  '/',

  upload.fields([

    {

      name: 'item_photos',

      maxCount: 10

    },

    {

      name: 'invoice_copy',

      maxCount: 10

    },

    {

      name: 'warranty_card_copy',

      maxCount: 10

    },

    {

      name: 'complaint_report',

      maxCount: 10

    },

    {

      name: 'additional_documents',

      maxCount: 20

    }

  ]),

  createWarrantyClaim

);


// ======================================================
// GET ALL CLAIMS
// ======================================================

router.get(

  '/',

  getWarrantyClaims

);


// ======================================================
// GET CLAIM BY ID
// ======================================================

router.get(

  '/:id',

  getWarrantyClaimById

);

// ======================================================
// UPDATE CLAIM
// ======================================================

router.put(

  '/:id',

  upload.fields([

    {

      name: 'item_photos',

      maxCount: 10

    },

    {

      name: 'invoice_copy',

      maxCount: 10

    },

    {

      name: 'warranty_card_copy',

      maxCount: 10

    },

    {

      name: 'complaint_report',

      maxCount: 10

    },

    {

      name: 'additional_documents',

      maxCount: 20

    }

  ]),

  updateWarrantyClaim

);


module.exports = router;