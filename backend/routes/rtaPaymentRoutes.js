const express = require("express");

const router = express.Router();

const {
  createPayment,
  getVendorPayments,
} = require(
  "../controllers/rtaPaymentController"
);

router.post(
  "/",
  createPayment
);

router.get(
  "/:vendorId",
  getVendorPayments
);

module.exports = router;