const db = require('../config/db');

const Repair = {

  // ✅ CREATE
  create: async (data) => {
    console.log('MODEL INSERT data.garage:', data.garage);
    const [result] = await db.query(
      'INSERT INTO repair_services SET ?',
      [data]
    );
    return result;
  },

  // ✅ GET ALL
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        r.*,
        v.vehicle_no AS live_vehicle_no
      FROM repair_services r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      ORDER BY r.created_at DESC
    `);
    return rows;
  },

  // ✅ GET BY VEHICLE
  getByVehicle: async (vehicleId) => {
    const [rows] = await db.query(`
      SELECT * FROM repair_services
      WHERE vehicle_id = ?
      ORDER BY created_at DESC
    `, [vehicleId]);

    return rows;
  },

  // ✅ GET BY ID
getById: async (id) => {
  const [rows] = await db.query(`
    SELECT 
      r.*,
      v.vehicle_no
    FROM repair_services r
    JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.id = ?
  `, [id]);

  return rows[0];
},



  // ✅ UPDATE
  update: async (id, data) => {
    const [result] = await db.query(
      'UPDATE repair_services SET ? WHERE id = ?',
      [data, id]
    );
    return result;
  },

  // ✅ DELETE
  delete: async (id) => {
    const [result] = await db.query(
      'DELETE FROM repair_services WHERE id = ?',
      [id]
    );
    return result;
  }

};

module.exports = Repair;