const express = require("express");

const router = express.Router();

const labourLedgerController = require("../controllers/labourLedgerController");

router.get(
  "/:vendorId",
  labourLedgerController.getLabourLedger
);

router.post(
  "/:vendorId/charges",
  labourLedgerController.addLabourCharge
);

router.delete(
  "/charges/:chargeId",
  labourLedgerController.deleteLabourCharge
);

module.exports = router;
