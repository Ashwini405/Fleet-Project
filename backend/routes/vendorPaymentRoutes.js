const express = require("express");
const upload = require("../config/multer");

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
  upload.single("bill_proof"),
  createPayment
);

module.exports = router;