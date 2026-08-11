const express = require("express");
const router = express.Router();

const {
  getAllLabourVendors,
  getLabourVendorById,
  createLabourVendor,
  updateLabourVendor
} = require("../controllers/labourVendorController");

router.get("/", getAllLabourVendors);
router.get("/:id", getLabourVendorById);
router.post("/", createLabourVendor);
router.put("/:id", updateLabourVendor);

module.exports = router;
