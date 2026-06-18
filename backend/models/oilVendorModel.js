const db = require("../config/db");

const OilVendor = {

  getAll: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM oil_vendors
      ORDER BY created_at DESC
    `);

    return rows;
  },

  getById: async (id) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM oil_vendors
      WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  create: async (data) => {

    const [result] = await db.query(
      `
      INSERT INTO oil_vendors
      (
        vendor_name,
        mobile_number,
        email,
        address_location,
        gst_number,
        opening_balance,
        status,
        bank_name,
        custom_bank_name,
        account_number,
        ifsc_code,
        upi_id
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.vendor_name,
        data.mobile_number,
        data.email || null,
        data.address_location || null,
        data.gst_number || null,
        data.opening_balance || 0,
        data.status || "Active",
        data.bank_name || null,
        data.custom_bank_name || null,
        data.account_number || null,
        data.ifsc_code || null,
        data.upi_id || null
      ]
    );

    return result;
  },

  update: async (id, data) => {

    const [result] = await db.query(
      `
      UPDATE oil_vendors
      SET
        vendor_name = ?,
        mobile_number = ?,
        email = ?,
        address_location = ?,
        gst_number = ?,
        opening_balance = ?,
        status = ?,
        bank_name = ?,
        custom_bank_name = ?,
        account_number = ?,
        ifsc_code = ?,
        upi_id = ?
      WHERE id = ?
      `,
      [
        data.vendor_name,
        data.mobile_number,
        data.email,
        data.address_location,
        data.gst_number,
        data.opening_balance,
        data.status,
        data.bank_name,
        data.custom_bank_name,
        data.account_number,
        data.ifsc_code,
        data.upi_id,
        id
      ]
    );

    return result;
  }

};

module.exports = OilVendor;