const express = require("express");

const router = express.Router();

const labourLedgerController = require("../controllers/labourLedgerController");

router.get(
  "/:vendorId",
  labourLedgerController.getLabourLedger
);

module.exports = router;
