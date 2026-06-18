const db = require("../config/db");

const FuelVendor = {

  getAll: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM fuel_vendors
      ORDER BY created_at DESC
    `);

    return rows;
  },

  getById: async (id) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM fuel_vendors
      WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  create: async (data) => {

    const [result] = await db.query(
      `
      INSERT INTO fuel_vendors
      (
        vendor_name,
        contact_person,
        mobile_number,
        email,
        address_location,
        fuel_types,
        gst_number,
        opening_balance,
        status,
        bank_name,
        custom_bank_name,
        account_number,
        ifsc_code,
        upi_id,
        notes
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.vendor_name,
        data.contact_person || null,
        data.mobile_number,
        data.email || null,
        data.address_location,
        JSON.stringify(data.fuel_types || []),
        data.gst_number || null,
        data.opening_balance || 0,
        data.status || "Active",
        data.bank_name || null,
        data.custom_bank_name || null,
        data.account_number || null,
        data.ifsc_code || null,
        data.upi_id || null,
        data.notes || null
      ]
    );

    return result;
  },

  update: async (id, data) => {

    const [result] = await db.query(
      `
      UPDATE fuel_vendors
      SET
        vendor_name = ?,
        contact_person = ?,
        mobile_number = ?,
        email = ?,
        address_location = ?,
        fuel_types = ?,
        gst_number = ?,
        opening_balance = ?,
        status = ?,
        bank_name = ?,
        custom_bank_name = ?,
        account_number = ?,
        ifsc_code = ?,
        upi_id = ?,
        notes = ?
      WHERE id = ?
      `,
      [
        data.vendor_name,
        data.contact_person,
        data.mobile_number,
        data.email,
        data.address_location,
        JSON.stringify(data.fuel_types || []),
        data.gst_number,
        data.opening_balance,
        data.status,
        data.bank_name,
        data.custom_bank_name,
        data.account_number,
        data.ifsc_code,
        data.upi_id,
        data.notes,
        id
      ]
    );

    return result;
  }

};

module.exports = FuelVendor;