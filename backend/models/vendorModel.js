const db = require("../config/db");

const Vendor = {

  // GET ALL VENDORS
  getAllVendors: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM vendors
      ORDER BY created_at DESC
    `);

    return rows;
  },

  // GET VENDORS BY CATEGORY
  getVendorsByCategory: async (category) => {
    const [rows] = await db.query(`
      SELECT id, garage_name
      FROM vendors
      WHERE category = ?
      ORDER BY garage_name
    `, [category]);

    return rows;
  },

  // GET SINGLE VENDOR
  getVendorById: async (id) => {

    const [rows] = await db.query(`
      SELECT *
      FROM vendors
      WHERE id = ?
    `, [id]);

    return rows[0];
  },

  // CREATE VENDOR
  createVendor: async (data) => {

    const {

      category,
      garage_name,
      mobile_number,
      address_location,
      bank_name,
      custom_bank_name,
      account_number_or_upi,
      ifsc_code

    } = data;

    const [result] = await db.query(
      `
      INSERT INTO vendors
      (
        category,
        garage_name,
        mobile_number,
        address_location,
        bank_name,
        custom_bank_name,
        account_number_or_upi,
        ifsc_code
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        category,
        garage_name,
        mobile_number,
        address_location,
        bank_name || null,
        custom_bank_name || null,
        account_number_or_upi || null,
        ifsc_code || null
      ]
    );

    return result;
  },

  // UPDATE VENDOR
  updateVendor: async (id, data) => {

    const {

      category,
      garage_name,
      mobile_number,
      address_location,
      bank_name,
      custom_bank_name,
      account_number_or_upi,
      ifsc_code

    } = data;

    const [result] = await db.query(
      `
      UPDATE vendors
      SET
        category=?,
        garage_name=?,
        mobile_number=?,
        address_location=?,
        bank_name=?,
        custom_bank_name=?,
        account_number_or_upi=?,
        ifsc_code=?
      WHERE id=?
      `,
      [
        category,
        garage_name,
        mobile_number,
        address_location,
        bank_name,
        custom_bank_name,
        account_number_or_upi,
        ifsc_code,
        id
      ]
    );

    return result;
  },

  // DELETE VENDOR
  deleteVendor: async (id) => {

    const [result] = await db.query(
      `
      DELETE FROM vendors
      WHERE id = ?
      `,
      [id]
    );

    return result;
  }

};

module.exports = Vendor;