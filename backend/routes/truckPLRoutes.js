const express = require("express");

const router = express.Router();

const truckPLController = require("../controllers/truckPLController");

// Fleet Report
router.get("/", truckPLController.getTruckPLList);

// Individual Truck Report
router.get("/:vehicleId", truckPLController.getTruckPL);

module.exports = router;