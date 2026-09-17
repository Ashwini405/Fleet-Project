const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const {
  createPayment,
  getVendorPayments,
} = require("../controllers/rtaPaymentController");

const handleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

router.post("/", handleUpload, createPayment);
router.get("/:vendorId", getVendorPayments);

module.exports = router;