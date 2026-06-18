const express = require("express");
const router = express.Router();

const {
  getPartsVendorLedger
} = require("../controllers/partsVendorLedgerController");

router.get(
  "/:id/ledger",
  getPartsVendorLedger
);

module.exports = router;