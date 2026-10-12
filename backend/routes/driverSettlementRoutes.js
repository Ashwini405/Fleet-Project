const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/permissionMiddleware");

const {
  getMonthDetails,
  getPlants,
  getVehiclesByPlant,
  getDriverByVehicle,
  getDriverByIdDirect,
  getSettlementDrivers,
  createSettlement,
  getSettlements,
  getPendingSettlements,
  getSettlementHistory,
  approveSettlement,
  rejectSettlement,
  markSettlementPaid,
  duplicateSettlement
} = require(
  "../controllers/driverSettlementController"
);

// ====================================
// Month trips + fuel/mileage for the salary sheet
// ====================================
router.get(
  "/month-details",
  ...protect("Operational Payments", "view"),
  getMonthDetails
);

// ====================================
// All Settlement Drivers List
// ====================================
router.get(
  "/drivers",
  getSettlementDrivers
);

// ====================================
// Driver Details Directly by Driver ID
// ====================================
router.get(
  "/driver-by-id/:driverId",
  getDriverByIdDirect
);

// ====================================
// Plants
// ====================================
router.get(
  "/plants",
  getPlants
);

// ====================================
// Vehicles By Plant
// ====================================
router.get(
  "/vehicles/:plant",
  getVehiclesByPlant
);

// ====================================
// Driver Details by Vehicle
// ====================================
router.get(
  "/driver/:vehicleNo",
  getDriverByVehicle
);


// ====================================
// Save Settlement
// ====================================
router.post(
  "/",
  createSettlement
);

// ====================================
// Pending Approvals
// ====================================
router.get(
  "/pending",
  getPendingSettlements
);

// ====================================
// Settlement History
// ====================================
router.get(
  "/history",
  getSettlementHistory
);

// ====================================
// All Settlements
// ====================================
router.get(
  "/",
  getSettlements
);

// ====================================
// Approve Settlement
// ====================================
router.put(
  "/approve/:id",
  approveSettlement
);

// ====================================
// Reject Settlement
// ====================================
router.put(
  "/reject/:id",
  rejectSettlement
);

// ====================================
// Mark Paid
// ====================================
router.put(
  "/paid/:id",
  markSettlementPaid
);

// ====================================
// Duplicate Settlement
// ====================================
router.post(
  "/duplicate/:id",
  duplicateSettlement
);

module.exports = router;