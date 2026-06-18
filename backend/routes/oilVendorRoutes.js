const express =
require("express");

const router =
express.Router();

const {

  getAllOilVendors,
  getOilVendorById,
  createOilVendor,
  updateOilVendor

} = require(
  "../controllers/oilVendorController"
);

// GET ALL
router.get(
  "/",
  getAllOilVendors
);

// GET SINGLE
router.get(
  "/:id",
  getOilVendorById
);

// CREATE
router.post(
  "/",
  createOilVendor
);

// UPDATE
router.put(
  "/:id",
  updateOilVendor
);

module.exports = router;