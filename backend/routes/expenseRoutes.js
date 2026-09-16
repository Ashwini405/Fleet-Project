const express = require("express");
const router = express.Router();

const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/permissionMiddleware");

router.get("/", ...protect("Income & Expense", "view"), getAllExpenses);
router.get("/:id", ...protect("Income & Expense", "view"), getExpenseById);
router.post("/", ...protect("Income & Expense", "create"), createExpense);
router.put("/:id", ...protect("Income & Expense", "edit"), updateExpense);
router.delete("/:id", ...protect("Income & Expense", "delete"), deleteExpense);

module.exports = router;