const express = require("express");

const router = express.Router();

const tyreLedgerController = require("../controllers/tyreLedgerController");

router.get(
  "/:vendorId",
  tyreLedgerController.getTyreLedger
);

module.exports = router;