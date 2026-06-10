const express = require("express");

const router = express.Router();

const {
  getVendorTransactions,
  createTransaction
} = require(
  "../controllers/vendorTransactionController"
);

// GET TRANSACTIONS OF VENDOR

router.get(
  "/:vendorId/transactions",
  getVendorTransactions
);

// CREATE TRANSACTION

router.post(
  "/transactions",
  createTransaction
);

module.exports = router;