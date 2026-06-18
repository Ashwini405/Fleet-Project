const db = require("../config/db");

const TyreVendor = {

  getAll: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM tyre_vendors
      ORDER BY created_at DESC
    `);

    return rows;
  },

  getById: async (id) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM tyre_vendors
      WHERE id = ?
      `,
      [id]
    );

    return rows[0];
  },

  create: async (data) => {

    const [result] = await db.query(
      `
      INSERT INTO tyre_vendors
      (
        vendor_name,
        vendor_type,
        contact_person,
        mobile_number,
        email,
        gst_number,
        address_location,
        services,
        status
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.vendor_name,
        data.vendor_type,
        data.contact_person || null,
        data.mobile_number,
        data.email || null,
        data.gst_number || null,
        data.address_location || null,
        JSON.stringify(data.services || []),
        data.status || "Active"
      ]
    );

    return result;
  },

  update: async (id, data) => {

    const [result] = await db.query(
      `
      UPDATE tyre_vendors
      SET
        vendor_name = ?,
        vendor_type = ?,
        contact_person = ?,
        mobile_number = ?,
        email = ?,
        gst_number = ?,
        address_location = ?,
        services = ?,
        status = ?
      WHERE id = ?
      `,
      [
        data.vendor_name,
        data.vendor_type,
        data.contact_person,
        data.mobile_number,
        data.email,
        data.gst_number,
        data.address_location,
        JSON.stringify(data.services || []),
        data.status,
        id
      ]
    );

    return result;
  }

};

module.exports = TyreVendor;