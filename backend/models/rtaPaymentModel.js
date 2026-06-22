const db = require("../config/db");

const createPayment = async (paymentData) => {
  const {
    vendor_id,
    payment_date,
    amount,
    payment_method,
    reference_no,
    notes,
  } = paymentData;

  const [result] = await db.query(
    `
    INSERT INTO rta_payments
    (
      vendor_id,
      payment_date,
      amount,
      payment_method,
      reference_no,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      vendor_id,
      payment_date,
      amount,
      payment_method,
      reference_no,
      notes,
    ]
  );

  return result;
};

const getPaymentsByVendor = async (vendorId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM rta_payments
    WHERE vendor_id = ?
    ORDER BY payment_date DESC
    `,
    [vendorId]
  );

  return rows;
};

module.exports = {
  createPayment,
  getPaymentsByVendor,
};