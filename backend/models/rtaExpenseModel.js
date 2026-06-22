const db = require("../config/db");

const createExpense = async (expenseData) => {
  const {
    vendor_id,
    vehicle_no,
    expense_type,
    expense_date,
    amount,
    reference_no,
    notes,
  } = expenseData;

  const [result] = await db.query(
    `
    INSERT INTO rta_expenses
    (
      vendor_id,
      vehicle_no,
      expense_type,
      expense_date,
      amount,
      reference_no,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      vendor_id,
      vehicle_no,
      expense_type,
      expense_date,
      amount,
      reference_no,
      notes,
    ]
  );

  return result;
};

const getExpensesByVendor = async (vendorId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM rta_expenses
    WHERE vendor_id = ?
    ORDER BY expense_date DESC
    `,
    [vendorId]
  );

  return rows;
};

module.exports = {
  createExpense,
  getExpensesByVendor,
};