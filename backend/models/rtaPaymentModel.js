const db = require("../config/db");

// Ensure columns exist in rta_payments
(async () => {
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rta_payments'`
    );
    const colNames = cols.map(c => c.COLUMN_NAME);
    if (!colNames.includes('expense_id')) {
      await db.query(`ALTER TABLE rta_payments ADD COLUMN expense_id INT DEFAULT NULL`);
      console.log('rta_payments: added expense_id column');
    }
    if (!colNames.includes('receipt_document')) {
      await db.query(`ALTER TABLE rta_payments ADD COLUMN receipt_document VARCHAR(255) DEFAULT NULL`);
      console.log('rta_payments: added receipt_document column');
    }
  } catch (err) {
    console.error('rta_payments column check error:', err.message);
  }
})();

const createPayment = async (paymentData) => {
  const {
    vendor_id,
    expense_id,
    payment_date,
    amount,
    payment_method,
    reference_no,
    notes,
    receipt_document,
  } = paymentData;

  const [result] = await db.query(
    `
    INSERT INTO rta_payments
    (
      vendor_id,
      expense_id,
      payment_date,
      amount,
      payment_method,
      reference_no,
      notes,
      receipt_document
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      vendor_id,
      expense_id ? Number(expense_id) : null,
      payment_date,
      amount,
      payment_method,
      reference_no,
      notes,
      receipt_document || null,
    ]
  );

  return result;
};

const getPaymentsByVendor = async (vendorId) => {
  const [rows] = await db.query(
    `
    SELECT 
      p.*,
      e.vehicle_no,
      e.expense_type,
      e.amount AS expense_total_amount,
      e.reference_no AS expense_reference_no
    FROM rta_payments p
    LEFT JOIN rta_expenses e ON p.expense_id = e.id
    WHERE p.vendor_id = ?
    ORDER BY p.payment_date DESC, p.id DESC
    `,
    [vendorId]
  );

  return rows;
};

module.exports = {
  createPayment,
  getPaymentsByVendor,
};
