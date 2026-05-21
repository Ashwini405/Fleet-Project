const db = require('../config/db');

const InspectionDefect = {

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO inspection_defects SET ?`,
      [data]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT id,
             inspection_id,
             vehicle_id,
             vehicle_no,
             issue_type,
             severity,
             breakdown_type,
             priority,
             status,
             description,
             created_repair_id,
             created_service_id,
             reported_by,
             inspection_date,
             resolved_at,
             evidence_files,
             created_at,
             updated_at
      FROM inspection_defects
      ORDER BY created_at DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT * FROM inspection_defects WHERE id = ?
    `, [id]);
    return rows[0];
  },

  getByVehicle: async (vehicleId) => {
    const [rows] = await db.query(`
      SELECT * FROM inspection_defects
      WHERE vehicle_id = ?
      ORDER BY created_at DESC
    `, [vehicleId]);
    return rows;
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE inspection_defects SET ? WHERE id = ?`,
      [data, id]
    );
    return result;
  },

  updateStatus: async (id, status, resolvedAt = null, repairId = null, serviceId = null) => {
    const payload = {
      status,
      updated_at: new Date()
    };
    if (resolvedAt) payload.resolved_at = resolvedAt;
    if (repairId) payload.created_repair_id = repairId;
    if (serviceId) payload.created_service_id = serviceId;
    const [result] = await db.query(
      `UPDATE inspection_defects SET ? WHERE id = ?`,
      [payload, id]
    );
    return result;
  }

};

module.exports = InspectionDefect;
