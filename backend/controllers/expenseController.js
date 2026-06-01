const Expense =
  require("../models/expenseModel");

// =========================================
// GET ALL EXPENSES
// =========================================

exports.getAllExpenses =
async (req, res) => {

  try {

    const expenses =
      await Expense.getAllExpenses();

    res.json({

      success: true,

      data: expenses,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch expenses",

    });

  }

};

// =========================================
// GET SINGLE EXPENSE
// =========================================

exports.getExpenseById =
async (req, res) => {

  try {

    const expense =
      await Expense.getExpenseById(
        req.params.id
      );

    res.json({

      success: true,

      data: expense,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch expense",

    });

  }

};

// =========================================
// CREATE EXPENSE
// =========================================

exports.createExpense =
async (req, res) => {

  try {

    const result =
      await Expense.createExpense(
        req.body
      );

    res.json({

      success: true,

      message:
        "Expense added successfully",

      expenseId:
        result.insertId,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to create expense",

    });

  }

};