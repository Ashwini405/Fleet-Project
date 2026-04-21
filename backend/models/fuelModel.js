const db = require('../config/db');

const Fuel = {

  // ✅ CREATE FUEL ENTRY
  create: async (fuelData) => {
    const [result] = await db.query(
      'INSERT INTO fuel_entries SET ?',
      [fuelData]
    );
    return result;
  },

  // ✅ GET ALL FUEL ENTRIES
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT f.*, v.vehicle_no
      FROM fuel_entries f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      ORDER BY f.created_at DESC
    `);
    return rows;
  },

  // ✅ GET BY VEHICLE
  getByVehicle: async (vehicleId) => {
    const [rows] = await db.query(
      'SELECT * FROM fuel_entries WHERE vehicle_id = ? ORDER BY created_at DESC',
      [vehicleId]
    );
    return rows;
  },

  // ✅ GET BY TRIP
  getByTrip: async (tripId) => {
    const [rows] = await db.query(
      'SELECT * FROM fuel_entries WHERE trip_id = ? ORDER BY created_at DESC',
      [tripId]
    );
    return rows;
  }

};

module.exports = Fuel;