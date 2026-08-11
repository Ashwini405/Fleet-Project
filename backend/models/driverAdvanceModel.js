const db = require('../config/db');

const DriverAdvance = {

  // ================= CREATE ADVANCE =================
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO driver_advances
      (driver_id, advance_date, amount, reason)
      VALUES (?, ?, ?, ?)`,
      [
        data.driver_id,
        data.advance_date,
        data.amount,
        data.reason || null
      ]
    );

    return result;
  },

  // ================= GET ADVANCES FOR A DRIVER =================
  getByDriver: async (driverId) => {
    const [rows] = await db.query(
      `SELECT * FROM driver_advances WHERE driver_id = ? ORDER BY advance_date DESC, id DESC`,
      [driverId]
    );

    return rows;
  },

  // ================= OUTSTANDING TOTAL FOR A DRIVER =================
  getOutstandingTotal: async (driverId) => {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM driver_advances
       WHERE driver_id = ? AND status = 'outstanding'`,
      [driverId]
    );

    return Number(rows[0].total);
  },

  // ================= MARK ALL OUTSTANDING ADVANCES RECOVERED =================
  markRecovered: async (driverId, settlementId) => {
    await db.query(
      `UPDATE driver_advances
       SET status = 'recovered', settlement_id = ?
       WHERE driver_id = ? AND status = 'outstanding'`,
      [settlementId, driverId]
    );
  },

  // ================= DELETE ADVANCE =================
  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM driver_advances WHERE id = ? AND status = 'outstanding'`,
      [id]
    );

    return result;
  }

};

module.exports = DriverAdvance;
