const db = require('../config/db');

const Inspection = {

  // ======================================================
  // CREATE INSPECTION
  // ======================================================

  create: async (data) => {

    const sql = `
      INSERT INTO inspections (

        inspection_number,

        plan_id,
        plan_title,
        plan_type,

        vehicle_id,
        vehicle_number,

        inspection_date,

        inspector_name,

        location,
        gps_coordinates,

        odometer,
        engine_hours,

        pre_notes,
        final_notes,

        checklist_results,

        total_items,
        passed_items,
        failed_items,
        pending_items,
        na_items,

        inspection_status,

        auto_create_workorder

      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [

      data.inspection_number,

      data.plan_id,
      data.plan_title,
      data.plan_type,

      data.vehicle_id,
      data.vehicle_number,

      data.inspection_date,

      data.inspector_name,

      data.location,
      data.gps_coordinates,

      data.odometer,
      data.engine_hours,

      data.pre_notes,
      data.final_notes,

      JSON.stringify(data.checklist_results),

      data.total_items,
      data.passed_items,
      data.failed_items,
      data.pending_items,
      data.na_items,

      data.inspection_status,

      data.auto_create_workorder

    ];

    const [result] = await db.query(sql, values);

    return result;
  },

  // ======================================================
  // GET ALL
  // ======================================================

  getAll: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM inspections
      ORDER BY created_at DESC
    `);

    return rows;
  },

  // ======================================================
  // GET BY ID
  // ======================================================

  getById: async (id) => {

    const [rows] = await db.query(`
      SELECT *
      FROM inspections
      WHERE id = ?
    `, [id]);

    return rows[0];
  }

};

module.exports = Inspection;