const express = require('express');

const router = express.Router();

const {
  createScrapRecord,
  getAllScrapRecords
} = require('../controllers/tyreScrapController');


// ======================================================
// CREATE SCRAP RECORD
// ======================================================

router.post(
  '/',
  createScrapRecord
);


// ======================================================
// GET ALL SCRAP RECORDS
// ======================================================

router.get(
  '/',
  getAllScrapRecords
);

module.exports = router;