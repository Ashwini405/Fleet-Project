const db = require('../config/db');

const Vehicle = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (vehicleData) => {
    const { vehicle_no, type } = vehicleData;
    const [result] = await db.query(
      'INSERT INTO vehicles (vehicle_no, type) VALUES (?, ?)',
      [vehicle_no, type]
    );
    return result;
  },

  update: async (id, vehicleData) => {
    const { vehicle_no, type } = vehicleData;
    const [result] = await db.query(
      'UPDATE vehicles SET vehicle_no = ?, type = ? WHERE id = ?',
      [vehicle_no, type, id]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Vehicle;
