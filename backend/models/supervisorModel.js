const db = require('../config/db');

const Supervisor = {

  // CREATE
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO supervisors
      (full_name, mobile, id_card_number, status, address, station_id,
       bank_name, account_number, ifsc_code, notes,
       profile_photo, id_document, bank_document)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.status,
        data.address,
        data.station_id || null,
        data.bank_name,
        data.account_number,
        data.ifsc_code,
        data.notes || null,
        data.profile_photo || null,
        data.id_document   || null,
        data.bank_document || null,
      ]
    );

    // Human-readable Supervisor ID, generated from the row's own auto-increment id
    const supervisorCode = `SUP-${String(result.insertId).padStart(4, '0')}`;
    await db.query(
      "UPDATE supervisors SET supervisor_code = ? WHERE id = ?",
      [supervisorCode, result.insertId]
    );

    return { ...result, supervisor_code: supervisorCode };
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

  // UPDATE
  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE supervisors SET
        full_name=?, mobile=?, id_card_number=?, status=?, address=?, station_id=?,
        bank_name=?, account_number=?, ifsc_code=?, notes=?
       WHERE id=?`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.status,
        data.address,
        data.station_id || null,
        data.bank_name,
        data.account_number,
        data.ifsc_code,
        data.notes || null,
        id
      ]
    );
    return result;
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