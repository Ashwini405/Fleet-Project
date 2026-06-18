const express =
require("express");

const router =
express.Router();

const {

  getAllFuelVendors,
  getFuelVendorById,
  createFuelVendor,
  updateFuelVendor

} = require(
  "../controllers/fuelVendorController"
);

// GET ALL
router.get(
  "/",
  getAllFuelVendors
);

// GET SINGLE
router.get(
  "/:id",
  getFuelVendorById
);

// CREATE
router.post(
  "/",
  createFuelVendor
);

// UPDATE
router.put(
  "/:id",
  updateFuelVendor
);

module.exports = router;