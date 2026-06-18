const express =
require("express");

const router =
express.Router();

const {

  getAllPartsVendors,
  getPartsVendorById,
  createPartsVendor,
  updatePartsVendor

} = require(
  "../controllers/partsVendorController"
);

router.get(
  "/",
  getAllPartsVendors
);

router.get(
  "/:id",
  getPartsVendorById
);

router.post(
  "/",
  createPartsVendor
);

router.put(
  "/:id",
  updatePartsVendor
);

module.exports = router;