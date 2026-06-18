const express =
require("express");

const router =
express.Router();

const {

  getAllTyreVendors,
  getTyreVendorById,
  createTyreVendor,
  updateTyreVendor

} = require(
  "../controllers/tyreVendorController"
);

router.get(
  "/",
  getAllTyreVendors
);

router.get(
  "/:id",
  getTyreVendorById
);

router.post(
  "/",
  createTyreVendor
);

router.put(
  "/:id",
  updateTyreVendor
);

module.exports = router;