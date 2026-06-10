const db = require("../config/db");

const VendorTransaction = {

  // GET BY VENDOR
  getByVendorId: async (vendorId) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM vendor_transactions
      WHERE vendor_id = ?
      ORDER BY transaction_date DESC, id DESC
      `,
      [vendorId]
    );

    return rows;
  },

  // CREATE TRANSACTION
  create: async (data) => {

    const {
      vendor_id,
      transaction_type,
      transaction_date,
      debit,
      credit,
      remarks
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO vendor_transactions (

        vendor_id,
        transaction_type,
        transaction_date,
        debit,
        credit,
        remarks

      )

      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        vendor_id,
        transaction_type,
        transaction_date,
        debit || 0,
        credit || 0,
        remarks || null
      ]
    );

    return result;
  }

};

module.exports = VendorTransaction;