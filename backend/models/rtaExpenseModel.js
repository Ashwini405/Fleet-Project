const db = require("../config/db");

// Ensure document column exists
(async () => {
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rta_expenses' AND COLUMN_NAME = 'document'`
    );
    if (!cols.length) {
      await db.query(`ALTER TABLE rta_expenses ADD COLUMN document VARCHAR(255) DEFAULT NULL`);
      console.log('rta_expenses: added document column');
    }
  } catch (err) {
    console.error('rta_expenses column check error:', err.message);
  }
})();

const createExpense = async (expenseData) => {
  const {
    vendor_id,
    vehicle_no,
    expense_type,
    expense_date,
    amount,
    reference_no,
    notes,
    document,
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
      notes,
      document
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      vendor_id,
      vehicle_no,
      expense_type,
      expense_date,
      amount,
      reference_no,
      notes,
      document || null,
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