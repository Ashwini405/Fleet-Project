const express = require("express");

const router = express.Router();

const rtaVendorController = require(
  "../controllers/rtaVendorController"
);

router.get(
  "/",
  rtaVendorController.getAllVendors
);

router.get(
  "/:id",
  rtaVendorController.getVendorById
);

router.post(
  "/",
  rtaVendorController.createVendor
);

router.put(
  "/:id",
  rtaVendorController.updateVendor
);

router.delete(
  "/:id",
  rtaVendorController.deleteVendor
);

module.exports = router;