const db = require("../config/db");

const Tender = {

  getAll: async (filters = {}) => {
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push("tender_status = ?");
      params.push(filters.status);
    }
    if (filters.plant) {
      conditions.push("plant_name = ?");
      params.push(filters.plant);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await db.query(
      `SELECT * FROM tenders ${whereClause} ORDER BY created_at DESC`,
      params
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(`SELECT * FROM tenders WHERE id = ?`, [id]);
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO tenders
        (tender_title, tender_ref_no, issuing_authority, plant_id, plant_name,
         submission_deadline, tender_status, quoted_price, awarded_price,
         document_upload, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.tender_title,
        data.tender_ref_no || null,
        data.issuing_authority || null,
        data.plant_id || null,
        data.plant_name || null,
        data.submission_deadline || null,
        data.tender_status || "Draft",
        data.quoted_price || null,
        data.awarded_price || null,
        data.document_upload || null,
        data.notes || null,
        data.created_by || "Admin",
      ]
    );
    return result;
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE tenders SET
        tender_title = ?,
        tender_ref_no = ?,
        issuing_authority = ?,
        plant_id = ?,
        plant_name = ?,
        submission_deadline = ?,
        tender_status = ?,
        quoted_price = ?,
        awarded_price = ?,
        document_upload = COALESCE(?, document_upload),
        notes = ?
       WHERE id = ?`,
      [
        data.tender_title,
        data.tender_ref_no || null,
        data.issuing_authority || null,
        data.plant_id || null,
        data.plant_name || null,
        data.submission_deadline || null,
        data.tender_status,
        data.quoted_price || null,
        data.awarded_price || null,
        data.document_upload || null,
        data.notes || null,
        id,
      ]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM tenders WHERE id = ?`, [id]);
    return result;
  },

};

module.exports = Tender;
