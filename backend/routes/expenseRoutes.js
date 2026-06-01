const express = require("express");

const router = express.Router();

const {

  getAllExpenses,

  getExpenseById,

  createExpense,

} = require(
  "../controllers/expenseController"
);

// =========================================
// ROUTES
// =========================================

router.get(
  "/",
  getAllExpenses
);

router.get(
  "/:id",
  getExpenseById
);

router.post(
  "/",
  createExpense
);

module.exports = router;