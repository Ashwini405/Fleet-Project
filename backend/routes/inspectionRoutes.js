const express = require('express');

const router = express.Router();

const {

  createInspection,
  getInspections,
  getInspectionById

} = require('../controllers/inspectionController');


// ======================================================
// CREATE
// ======================================================

router.post(
  '/',
  createInspection
);


// ======================================================
// GET ALL
// ======================================================

router.get(
  '/',
  getInspections
);


// ======================================================
// GET BY ID
// ======================================================

router.get(
  '/:id',
  getInspectionById
);


module.exports = router;