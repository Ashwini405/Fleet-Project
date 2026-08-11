const express = require("express");
const router = express.Router();
const fastagController = require("../controllers/fastagController");
const { protect } = require("../middleware/permissionMiddleware");

// Accounts
router.get("/", ...protect("Fastag", "view"), fastagController.getAllAccounts);
router.post("/", ...protect("Fastag", "create"), fastagController.createAccount);
router.put("/:id", ...protect("Fastag", "edit"), fastagController.updateAccount);

// Transactions
router.get("/transactions/all", ...protect("Fastag", "view"), fastagController.getAllTransactions);
router.get("/:vehicleId/transactions", ...protect("Fastag", "view"), fastagController.getTransactionsByVehicle);
router.post("/recharge", ...protect("Fastag", "create"), fastagController.recharge);
router.post("/toll-deduction", ...protect("Fastag", "create"), fastagController.tollDeduction);

module.exports = router;
