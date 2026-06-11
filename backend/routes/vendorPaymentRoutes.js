const express = require("express");

const router = express.Router();

const {
  getVendorPayments,
  createPayment
} = require(
  "../controllers/vendorPaymentController"
);

// GET PAYMENTS

router.get(
  "/:vendorId/payments",
  getVendorPayments
);

// CREATE PAYMENT

router.post(
  "/payments",
  createPayment
);

module.exports = router;