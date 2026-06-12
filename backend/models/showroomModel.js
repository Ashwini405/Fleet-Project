const db = require("../config/db");

const Showroom = {

  // GET ALL SHOWROOMS
  getAll: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM showrooms
      ORDER BY created_at DESC
    `);

    return rows;
  },

  // GET SINGLE SHOWROOM
  getById: async (id) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM showrooms
      WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  // CREATE SHOWROOM
  create: async (data) => {

    const {
      showroom_name,
      mobile_number,
      email,
      address_location,
      status,

      contact_person,
      designation,

      bank_name,
      custom_bank_name,

      account_number,
      ifsc_code,
      upi_id,

      opening_balance
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO showrooms
      (
        showroom_name,
        mobile_number,
        email,
        address_location,
        status,

        contact_person,
        designation,

        bank_name,
        custom_bank_name,

        account_number,
        ifsc_code,
        upi_id,

        opening_balance
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        showroom_name,
        mobile_number,
        email || null,
        address_location || null,
        status || "Active",

        contact_person || null,
        designation || null,

        bank_name || null,
        custom_bank_name || null,

        account_number || null,
        ifsc_code || null,
        upi_id || null,

        opening_balance || 0
      ]
    );

    return result;
  },

  // UPDATE SHOWROOM
  update: async (id, data) => {

    const {
      showroom_name,
      mobile_number,
      email,
      address_location,
      status,
      contact_person,
      designation,
      bank_name,
      custom_bank_name,
      account_number,
      ifsc_code,
      upi_id
    } = data;

    const [result] = await db.query(
      `
      UPDATE showrooms
      SET
        showroom_name = ?,
        mobile_number = ?,
        email = ?,
        address_location = ?,
        status = ?,
        contact_person = ?,
        designation = ?,
        bank_name = ?,
        custom_bank_name = ?,
        account_number = ?,
        ifsc_code = ?,
        upi_id = ?
      WHERE id = ?
      `,
      [
        showroom_name,
        mobile_number,
        email,
        address_location,
        status,
        contact_person,
        designation,
        bank_name,
        custom_bank_name,
        account_number,
        ifsc_code,
        upi_id,
        id
      ]
    );

    return result;
  }

};

module.exports = Showroom;