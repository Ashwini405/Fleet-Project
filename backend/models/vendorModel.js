const db = require("../config/db");

const Vendor = {

  // =====================================
  // GET ALL VENDORS
  // =====================================

  getAllVendors: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM vendors
      ORDER BY created_at DESC
    `);

    return rows;
  },

  // =====================================
  // GET VENDORS BY CATEGORY
  // =====================================

  getVendorsByCategory: async (category) => {

    const [rows] = await db.query(`
      SELECT *
      FROM vendors
      WHERE category = ?
      ORDER BY garage_name ASC
    `, [category]);

    return rows;
  },

  // =====================================
  // GET SINGLE VENDOR
  // =====================================

  getVendorById: async (id) => {

    const [rows] = await db.query(`
      SELECT *
      FROM vendors
      WHERE id = ?
    `, [id]);

    return rows[0];
  },

  // =====================================
  // CREATE VENDOR
  // =====================================

  createVendor: async (data) => {

  console.log("\nMODEL RECEIVED DATA:");
  console.log(data);

  const {

    category,
    garage_name,
    mobile_number,
    email,
    address_location,
    gst_number,
    opening_balance,
    status,

    bank_name,
    custom_bank_name,
    account_number_or_upi,
    ifsc_code,
    upi_id

  } = data;

  console.log("\nINSERT VALUES:");
  console.log({
    category,
    garage_name,
    mobile_number,
    email,
    address_location,
    gst_number,
    opening_balance,
    status,
    bank_name,
    custom_bank_name,
    account_number_or_upi,
    ifsc_code,
    upi_id
  });

  const [result] = await db.query(
    `
    INSERT INTO vendors
    (
      category,
      garage_name,
      mobile_number,
      email,
      address_location,
      gst_number,
      opening_balance,
      status,
      bank_name,
      custom_bank_name,
      account_number_or_upi,
      ifsc_code,
      upi_id
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      category,
      garage_name,
      mobile_number,
      email || null,
      address_location || null,
      gst_number || null,
      opening_balance || 0,
      status || "Active",
      bank_name || null,
      custom_bank_name || null,
      account_number_or_upi || null,
      ifsc_code || null,
      upi_id || null
    ]
  );

  console.log("\nMYSQL INSERT RESULT:");
  console.log(result);

  return result;
},

  // =====================================
  // UPDATE VENDOR
  // =====================================

  updateVendor: async (id, data) => {

    const {

      category,
      garage_name,
      mobile_number,
      email,
      address_location,
      gst_number,
      opening_balance,
      status,

      bank_name,
      custom_bank_name,
      account_number_or_upi,
      ifsc_code,
      upi_id

    } = data;

    const [result] = await db.query(
      `
      UPDATE vendors
      SET

        category = ?,
        garage_name = ?,
        mobile_number = ?,
        email = ?,
        address_location = ?,
        gst_number = ?,
        opening_balance = ?,
        status = ?,

        bank_name = ?,
        custom_bank_name = ?,
        account_number_or_upi = ?,
        ifsc_code = ?,
        upi_id = ?

      WHERE id = ?
      `,
      [
        category,
        garage_name,
        mobile_number,
        email,
        address_location,
        gst_number,
        opening_balance,
        status,

        bank_name,
        custom_bank_name,
        account_number_or_upi,
        ifsc_code,
        upi_id,

        id
      ]
    );

    return result;
  },

  // =====================================
  // DELETE VENDOR
  // =====================================

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