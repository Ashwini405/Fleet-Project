const db = require("../config/db");

const VendorPayment = {

  // GET PAYMENTS BY VENDOR (scoped to a category — vendor_id is not
  // globally unique across vendor tables, e.g. a tyre vendor and a garage
  // vendor can share the same numeric id)
  getByVendorId: async (vendorId, vendorCategory) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM vendor_payments
      WHERE vendor_id = ? AND vendor_category = ?
      ORDER BY payment_date DESC, id DESC
      `,
      [vendorId, vendorCategory]
    );

    return rows;
  },

  // CREATE PAYMENT
  create: async (data) => {

    const {
      vendor_id,
      vendor_category,
      payment_date,
      amount,
      payment_mode,
      reference_number,
      notes,
      receipt_files
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO vendor_payments
      (
        vendor_id,
        vendor_category,
        payment_date,
        amount,
        payment_mode,
        reference_number,
        notes,
        receipt_files
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        vendor_id,
        vendor_category || null,
        payment_date,
        amount,
        payment_mode,
        reference_number || null,
        notes || null,
        receipt_files || null
      ]
    );

    return result;
  }

};

module.exports = VendorPayment;