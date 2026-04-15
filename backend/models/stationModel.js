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
    const [rows] = await db.query(
      "SELECT * FROM stations ORDER BY created_at DESC"
    );
    return rows;
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