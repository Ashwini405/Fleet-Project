const db = require("../config/db");

const VendorPayment = {

  // GET PAYMENTS BY VENDOR
  getByVendorId: async (vendorId) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM vendor_payments
      WHERE vendor_id = ?
      ORDER BY payment_date DESC, id DESC
      `,
      [vendorId]
    );

    return rows;
  },

  // CREATE PAYMENT
  create: async (data) => {

    const {
      vendor_id,
      payment_date,
      amount,
      payment_mode,
      reference_number,
      notes
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO vendor_payments
      (
        vendor_id,
        payment_date,
        amount,
        payment_mode,
        reference_number,
        notes
      )
      VALUES
      (?, ?, ?, ?, ?, ?)
      `,
      [
        vendor_id,
        payment_date,
        amount,
        payment_mode,
        reference_number || null,
        notes || null
      ]
    );

    return result;
  }

};

module.exports = VendorPayment;