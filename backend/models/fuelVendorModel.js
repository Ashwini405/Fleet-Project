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
    let fuelTypesJson = '[]';
    if (Array.isArray(data.fuel_types)) {
      fuelTypesJson = JSON.stringify(data.fuel_types);
    } else if (typeof data.fuel_types === 'string') {
      try {
        const parsed = JSON.parse(data.fuel_types);
        fuelTypesJson = Array.isArray(parsed) ? data.fuel_types : JSON.stringify([data.fuel_types]);
      } catch {
        fuelTypesJson = JSON.stringify([data.fuel_types]);
      }
    }

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
        payment_terms,
        bank_name,
        custom_bank_name,
        account_number,
        ifsc_code,
        upi_id,
        notes
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.vendor_name,
        data.contact_person || null,
        data.mobile_number,
        data.email || null,
        data.address_location,
        fuelTypesJson,
        data.gst_number || null,
        data.opening_balance != null ? Number(data.opening_balance) || 0 : 0,
        data.status || "Active",
        data.payment_terms || "credit",
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
    const rawFt = data.fuel_types !== undefined ? data.fuel_types : data.fuelTypes;
    let fuelTypesJson = '[]';
    if (Array.isArray(rawFt)) {
      fuelTypesJson = JSON.stringify(rawFt);
    } else if (typeof rawFt === 'string') {
      try {
        const parsed = JSON.parse(rawFt);
        fuelTypesJson = Array.isArray(parsed) ? rawFt : JSON.stringify([rawFt]);
      } catch {
        fuelTypesJson = JSON.stringify([rawFt]);
      }
    }

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
        payment_terms = ?,
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
        data.contact_person || null,
        data.mobile_number,
        data.email || null,
        data.address_location,
        fuelTypesJson,
        data.gst_number || null,
        data.opening_balance != null ? Number(data.opening_balance) || 0 : 0,
        data.status || "Active",
        data.payment_terms || "credit",
        data.bank_name || null,
        data.custom_bank_name || null,
        data.account_number || null,
        data.ifsc_code || null,
        data.upi_id || null,
        data.notes || null,
        id
      ]
    );

    return result;
  }
};

module.exports = FuelVendor;