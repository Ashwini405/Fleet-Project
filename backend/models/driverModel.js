const db = require('../config/db');

const Driver = {

  // ================= CREATE DRIVER =================
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO drivers
      (
        full_name,
        mobile,
        id_card_number,
        status,
        address,
        station_id,
        vehicle_id,
        bank_name,
        account_number,
        ifsc_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.status,
        data.address,
        data.station_id,
        data.vehicle_id,
        data.bank_name,
        data.account_number,
        data.ifsc_code
      ]
    );

    return result;
  },

  // ================= GET ALL DRIVERS =================
  getAll: async () => {

    const [rows] = await db.query(`
      SELECT
        d.*,
        s.station_name,
        v.vehicle_no
      FROM drivers d
      LEFT JOIN stations s
        ON d.station_id = s.id
      LEFT JOIN vehicles v
        ON d.vehicle_id = v.id
      ORDER BY d.created_at DESC
    `);

    return rows;
  },

  // ================= DRIVER PROFILE =================
  getProfile: async (id) => {

    // Driver Details
    const [driverRows] = await db.query(`
      SELECT
        d.*,
        s.station_name,
        v.vehicle_no
      FROM drivers d
      LEFT JOIN stations s
        ON d.station_id = s.id
      LEFT JOIN vehicles v
        ON d.vehicle_id = v.id
      WHERE d.id = ?
    `, [id]);

    // Trips
    const [tripRows] = await db.query(`
      SELECT *
      FROM trips
      WHERE driver_id = ?
      ORDER BY trip_date DESC
    `, [id]);

    // Settlements / Payments
    const [paymentRows] = await db.query(`
      SELECT *
      FROM driver_settlements
      WHERE driver_id = ?
      ORDER BY created_at DESC
    `, [id]);

    return {
      driver: driverRows[0],
      trips: tripRows,
      payments: paymentRows
    };
  },

  // ================= DELETE DRIVER =================
  delete: async (id) => {

    const [result] = await db.query(
      "DELETE FROM drivers WHERE id = ?",
      [id]
    );

    return result;
  }

};

module.exports = Driver;