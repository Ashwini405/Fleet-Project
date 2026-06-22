const express = require("express");

const router = express.Router();

const {
  createExpense,
  getVendorExpenses,
} = require(
  "../controllers/rtaExpenseController"
);

router.post(
  "/",
  createExpense
);

router.get(
  "/:vendorId",
  getVendorExpenses
);

module.exports = router;