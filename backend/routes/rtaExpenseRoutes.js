const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const {
  createExpense,
  getVendorExpenses,
} = require("../controllers/rtaExpenseController");

const handleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

router.post("/", handleUpload, createExpense);
router.get("/:vendorId", getVendorExpenses);

module.exports = router;