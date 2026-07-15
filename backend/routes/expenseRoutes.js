const express = require("express");

const router = express.Router();

const {

  getAllExpenses,

  getExpenseById,

  createExpense,

} = require(
  "../controllers/expenseController"
);
const { protect } = require("../middleware/permissionMiddleware");

// =========================================
// ROUTES
// =========================================

router.get(
  "/",
  ...protect("Income & Expense", "view"),
  getAllExpenses
);

router.get(
  "/:id",
  ...protect("Income & Expense", "view"),
  getExpenseById
);

router.post(
  "/",
  ...protect("Income & Expense", "create"),
  createExpense
);

module.exports = router;