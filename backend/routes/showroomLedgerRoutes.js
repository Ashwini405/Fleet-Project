const express = require("express");

const router = express.Router();

const {
  getShowroomLedger
} = require(
  "../controllers/showroomLedgerController"
);

router.get(
  "/:id",
  getShowroomLedger
);

module.exports = router;