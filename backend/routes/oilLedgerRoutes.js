const express = require("express");

const router = express.Router();

const oilLedgerController =
  require("../controllers/oilLedgerController");

router.get(
  "/:vendorId",
  oilLedgerController.getOilLedger
);

module.exports = router;