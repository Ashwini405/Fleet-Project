const db = require('../config/db');

const Supervisor = {

  // CREATE
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO supervisors 
      (full_name, mobile, id_card_number, status, address, station_id,
       bank_name, account_number, ifsc_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.status,
        data.address,
        data.station_id,
        data.bank_name,
        data.account_number,
        data.ifsc_code
      ]
    );
    return result;
  },

  // GET ALL (with station name JOIN 🔥)
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT s.*, st.station_name 
      FROM supervisors s
      LEFT JOIN stations st ON s.station_id = st.id
      ORDER BY s.created_at DESC
    `);
    return rows;
  },

  // DELETE
  delete: async (id) => {
    const [result] = await db.query(
      "DELETE FROM supervisors WHERE id = ?",
      [id]
    );
    return result;
  }

};

module.exports = Supervisor;