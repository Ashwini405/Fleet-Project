const express = require("express");
const router = express.Router();
const fastagController = require("../controllers/fastagController");
const { protect } = require("../middleware/permissionMiddleware");

// FASTag expenses (deductions recorded as truck expenses)
router.get("/expenses", ...protect("Fastag", "view"), fastagController.getExpenses);
router.post("/expenses", ...protect("Fastag", "create"), fastagController.createExpense);
router.post("/expenses/validate", ...protect("Fastag", "create"), fastagController.validateExpenses);
router.post("/expenses/bulk", ...protect("Fastag", "create"), fastagController.bulkUploadExpenses);
router.delete("/expenses/:id", ...protect("Fastag", "delete"), fastagController.deleteExpense);

// Accounts (vehicle ↔ tag mapping)
router.get("/", ...protect("Fastag", "view"), fastagController.getAllAccounts);
router.post("/", ...protect("Fastag", "create"), fastagController.createAccount);
router.put("/:id", ...protect("Fastag", "edit"), fastagController.updateAccount);

// Legacy wallet transactions for a vehicle
router.get("/:vehicleId/transactions", ...protect("Fastag", "view"), fastagController.getTransactionsByVehicle);

module.exports = router;
