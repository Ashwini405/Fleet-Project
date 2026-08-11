const db = require("../config/db");

const TruckInventory = {

  getByVehicle: async (vehicleId) => {
    const [rows] = await db.query(
      `SELECT * FROM truck_inventory WHERE vehicle_id = ? ORDER BY created_at DESC`,
      [vehicleId]
    );
    return rows;
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO truck_inventory (vehicle_id, part_name, category, quantity, assigned_date, \`condition\`)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.vehicle_id,
        data.part_name,
        data.category,
        data.quantity,
        data.assigned_date || null,
        data.condition,
      ]
    );
    return result;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM truck_inventory WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE truck_inventory SET
        part_name = ?,
        category = ?,
        quantity = ?,
        assigned_date = ?,
        \`condition\` = ?
       WHERE id = ?`,
      [
        data.part_name,
        data.category,
        data.quantity,
        data.assigned_date || null,
        data.condition,
        id,
      ]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM truck_inventory WHERE id = ?`,
      [id]
    );
    return result;
  },

};

module.exports = TruckInventory;
