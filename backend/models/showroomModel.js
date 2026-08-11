const db = require("../config/db");

const Showroom = {

  // GET ALL SHOWROOMS (with vehicle purchase + warranty claim stats)
  getAll: async () => {

    const [rows] = await db.query(`
      SELECT
        s.*,
        COALESCE(vAgg.vehicles_purchased, 0)     AS vehicles_purchased,
        COALESCE(vAgg.total_purchase_value, 0)   AS total_purchase_value,
        COALESCE(cAgg.total_warranty_claims, 0)  AS total_warranty_claims,
        COALESCE(cAgg.pending_claims, 0)         AS pending_claims,
        COALESCE(cAgg.pending_warranty_amount, 0) AS pending_warranty_amount
      FROM showrooms s
      LEFT JOIN (
        SELECT
          dealer_showroom,
          COUNT(*) AS vehicles_purchased,
          SUM(purchase_amount) AS total_purchase_value
        FROM vehicles
        WHERE dealer_showroom IS NOT NULL AND dealer_showroom <> ''
        GROUP BY dealer_showroom
      ) vAgg ON vAgg.dealer_showroom = s.showroom_name
      LEFT JOIN (
        SELECT
          v.dealer_showroom,
          COUNT(*) AS total_warranty_claims,
          SUM(CASE WHEN wc.claim_status IN ('Submitted', 'Pending Parts') THEN 1 ELSE 0 END) AS pending_claims,
          SUM(CASE WHEN wc.claim_status IN ('Submitted', 'Pending Parts') THEN wc.claim_available_amount ELSE 0 END) AS pending_warranty_amount
        FROM warranty_claims wc
        JOIN vehicles v ON v.vehicle_no = wc.vehicle_no
        WHERE v.dealer_showroom IS NOT NULL AND v.dealer_showroom <> ''
        GROUP BY v.dealer_showroom
      ) cAgg ON cAgg.dealer_showroom = s.showroom_name
      ORDER BY s.created_at DESC
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
      payment_terms,

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
        payment_terms,

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
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        showroom_name,
        mobile_number,
        email || null,
        address_location || null,
        status || "Active",
        payment_terms || "credit",

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
      payment_terms,
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
        payment_terms = ?,
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
        payment_terms || "credit",
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