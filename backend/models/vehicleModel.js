const db = require('../config/db');

// Live odometer: the highest reading the system has seen for the vehicle —
// its initial odometer, any fuel entry reading, or any trip start reading.
const CURRENT_ODOMETER_SQL = `
  GREATEST(
    IFNULL(v.initial_odometer, 0),
    IFNULL((SELECT MAX(fe.current_odo) FROM fuel_entries fe WHERE fe.vehicle_id = v.id), 0),
    IFNULL((SELECT MAX(tr.start_odometer) FROM trips tr WHERE tr.vehicle_id = v.id AND IFNULL(tr.is_deleted, 0) = 0), 0)
  ) AS current_odometer`;

const Vehicle = {

  // ✅ GET ALL VEHICLES (WITH RELATIONS)
  getAll: async () => {
    try {
      const [rows] = await db.query(`
  SELECT v.*,
         ${CURRENT_ODOMETER_SQL},
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
           ${CURRENT_ODOMETER_SQL},
           s.full_name AS supervisor_name,
           d.full_name AS driver_name,
           d.mobile AS driver_contact,
           st.station_name AS source_plant,
           CASE
             WHEN EXISTS (SELECT 1 FROM trips t WHERE t.vehicle_id = v.id AND t.trip_status IN ('Active', 'In Transit', 'Started', 'Planned')) THEN 'On Trip'
             WHEN EXISTS (SELECT 1 FROM repair_services r WHERE r.vehicle_id = v.id AND r.status IN ('Reported', 'Under Repair', 'In Progress')) THEN 'Under Repair'
             WHEN LOWER(COALESCE(v.vehicle_status, 'active')) = 'inactive' THEN 'Inactive'
             ELSE 'Active'
           END AS vehicle_status,
          COALESCE(fa.fastag_id, v.fastag_id) AS fastag_id,
          fa.id AS fastag_account_id,
          fa.bank_issuer AS fastag_bank_issuer,
          fa.linked_account_no AS fastag_linked_account_no,
          fa.balance AS fastag_balance,
          fa.low_balance_threshold AS fastag_low_balance_threshold,
          fa.status AS fastag_status
    FROM vehicles v
    LEFT JOIN supervisors s ON v.supervisor_id = s.id
    LEFT JOIN drivers d ON v.assigned_driver = d.id
    LEFT JOIN stations st ON v.station_id = st.id
    LEFT JOIN fastag_accounts fa ON fa.vehicle_id = v.id
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
           ${CURRENT_ODOMETER_SQL},
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


Vehicle.CURRENT_ODOMETER_SQL = CURRENT_ODOMETER_SQL;

module.exports = Vehicle;
