const db = require('../config/db');

const Station = {
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO stations 
      (station_name, station_code, location, manager_name, contact_number)
      VALUES (?, ?, ?, ?, ?)`,
      [
        data.station_name,
        data.station_code,
        data.location,
        data.manager_name,
        data.contact_number
      ]
    );
    return result;
  },

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT
        s.*,
        COUNT(v.id) AS vehicle_count
      FROM stations s
      LEFT JOIN vehicles v
        ON v.station_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    return rows;
  },

  // Vehicles currently assigned to this station, with their driver (if any)
  getVehicles: async (id) => {
    const [rows] = await db.query(`
      SELECT
        v.id,
        v.vehicle_no,
        v.type,
        v.vehicle_status,
        d.full_name AS driver_name
      FROM vehicles v
      LEFT JOIN drivers d
        ON v.assigned_driver = d.id
      WHERE v.station_id = ?
      ORDER BY v.vehicle_no
    `, [id]);
    return rows;
  },

  // Names of records still pointing at this station, so a blocked delete
  // can tell the user exactly what to reassign instead of a generic error.
  getDependents: async (id) => {
    const [supervisors] = await db.query(
      "SELECT full_name FROM supervisors WHERE station_id = ?", [id]
    );
    const [drivers] = await db.query(
      "SELECT full_name FROM drivers WHERE station_id = ?", [id]
    );
    const [vehicles] = await db.query(
      "SELECT vehicle_no FROM vehicles WHERE station_id = ?", [id]
    );
    const [trips] = await db.query(
      "SELECT trip_id FROM trips WHERE station_id = ?", [id]
    );

    return {
      supervisors: supervisors.map(r => r.full_name),
      drivers: drivers.map(r => r.full_name),
      vehicles: vehicles.map(r => r.vehicle_no),
      trips: trips.map(r => r.trip_id),
    };
  },

  // DELETE
delete: async (id) => {
  const [result] = await db.query("DELETE FROM stations WHERE id = ?", [id]);
  return result;
},

// UPDATE
update: async (id, data) => {
  const [result] = await db.query(
    `UPDATE stations SET 
      station_name=?, station_code=?, location=?, manager_name=?, contact_number=?
     WHERE id=?`,
    [
      data.station_name,
      data.station_code,
      data.location,
      data.manager_name,
      data.contact_number,
      id
    ]
  );
  return result;
}
};

module.exports = Station;