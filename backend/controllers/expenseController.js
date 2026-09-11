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

exports.updateExpense = async (req, res) => {
  try {
    const allowed = [
      'expense_category', 'expense_date', 'amount', 'payment_method',
      'vendor_payee', 'description', 'payment_status', 'vehicle_id',
      'vehicle_number', 'trip_id', 'trip_number', 'updated_by'
    ];
    const fields = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key))
    );
    const result = await Expense.updateExpense(req.params.id, fields);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const result = await Expense.deleteExpense(req.params.id);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
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