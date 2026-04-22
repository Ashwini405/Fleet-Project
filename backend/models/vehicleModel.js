const db = require('../config/db');

const Vehicle = {

  // ✅ GET ALL VEHICLES (WITH RELATIONS)
  getAll: async () => {
    try {
      const [rows] = await db.query(`
  SELECT v.*,
         s.full_name AS supervisor_name,
         d.full_name AS driver_name,
         d.mobile AS driver_contact,
         st.station_name AS source_plant
  FROM vehicles v
  LEFT JOIN supervisors s ON v.supervisor_id = s.id
  LEFT JOIN drivers d ON v.assigned_driver = d.id
  LEFT JOIN stations st ON v.station_id = st.id
  ORDER BY v.created_at DESC
`);
      return rows;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  },

  // ✅ GET VEHICLE BY ID
 getById: async (id) => {
  const [rows] = await db.query(`
    SELECT v.*,
           s.full_name AS supervisor_name,
           d.full_name AS driver_name,
           d.mobile AS driver_contact,
           st.station_name AS source_plant
    FROM vehicles v
    LEFT JOIN supervisors s ON v.supervisor_id = s.id
    LEFT JOIN drivers d ON v.assigned_driver = d.id
    LEFT JOIN stations st ON v.station_id = st.id
    WHERE v.id = ?
  `, [id]);

  return rows[0];
},

  // 🔥 CREATE VEHICLE (NO FIELD MISMATCH)
  create: async (vehicleData) => {
    try {
      const [result] = await db.query(
        'INSERT INTO vehicles SET ?',
        [vehicleData]
      );
      return result;
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  },

  // 🔥 UPDATE VEHICLE (FULL UPDATE SUPPORT)
  update: async (id, vehicleData) => {
    try {
      const [result] = await db.query(
        'UPDATE vehicles SET ? WHERE id = ?',
        [vehicleData, id]
      );
      return result;
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  },

  // ✅ DELETE VEHICLE
  delete: async (id) => {
    try {
      const [result] = await db.query(
        'DELETE FROM vehicles WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },
 getByNumber: async (vehicle_no) => {
  const [rows] = await db.query(`
    SELECT v.*,
           d.full_name AS driver_name,
           d.mobile AS driver_contact,
           s.full_name AS supervisor_name,
           st.station_name AS source_plant
    FROM vehicles v
    LEFT JOIN drivers d ON v.assigned_driver = d.id
    LEFT JOIN supervisors s ON v.supervisor_id = s.id
    LEFT JOIN stations st ON v.station_id = st.id
    WHERE v.vehicle_no = ?
  `, [vehicle_no]);

  return rows[0];
}

};


module.exports = Vehicle;