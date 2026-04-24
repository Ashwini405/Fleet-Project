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

  // ✅ GET ALL FUEL ENTRIES (WITH RELATIONS)
getAll: async () => {
  const [rows] = await db.query(`
    SELECT f.*,
           v.vehicle_no,
           t.trip_id,
           t.driver_name,
           s.full_name AS supervisor_name   -- ✅ ADD THIS
    FROM fuel_entries f
    LEFT JOIN vehicles v ON f.vehicle_id = v.id
    LEFT JOIN trips t ON f.trip_id = t.id
    LEFT JOIN supervisors s ON v.supervisor_id = s.id  
    ORDER BY f.created_at DESC
  `);
  return rows;
},

  // ✅ GET BY VEHICLE (WITH TRIP INFO)
  getByVehicle: async (vehicleId) => {
    const [rows] = await db.query(`
      SELECT f.*,
             t.trip_id,
             t.driver_name
      FROM fuel_entries f
      LEFT JOIN trips t ON f.trip_id = t.id
      WHERE f.vehicle_id = ?
      ORDER BY f.created_at DESC
    `, [vehicleId]);
    return rows;
  },

  // ✅ GET BY TRIP (matches on numeric trip DB id stored in fuel_entries.trip_id)
  getByTrip: async (tripId) => {
    const [rows] = await db.query(`
      SELECT f.*,
             v.vehicle_no,
             t.trip_id AS trip_string_id,
             t.driver_name,
             s.full_name AS supervisor_name
      FROM fuel_entries f
      LEFT JOIN trips t ON f.trip_id = t.id
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN supervisors s ON t.supervisor_id = s.id
      WHERE f.trip_id = ?
      ORDER BY f.created_at DESC
    `, [tripId]);
    return rows;
  },

  // ✅ UPDATE FUEL ENTRY
  update: async (id, fuelData) => {
    const [result] = await db.query(
      'UPDATE fuel_entries SET ? WHERE id = ?',
      [fuelData, id]
    );
    return result;
  },

  // ✅ DELETE FUEL ENTRY
  delete: async (id) => {
    const [result] = await db.query(
      'DELETE FROM fuel_entries WHERE id = ?',
      [id]
    );
    return result;
  }

};

module.exports = Fuel;