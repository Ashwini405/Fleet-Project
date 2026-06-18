const express = require("express");

const router = express.Router();

const fuelLedgerController =
  require("../controllers/fuelLedgerController");

router.get(
  "/:vendorId",
  fuelLedgerController.getFuelLedger
);

module.exports = router;