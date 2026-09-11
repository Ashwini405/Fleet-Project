const db = require('../config/db');

const Trip = {

  // ✅ CREATE TRIP
  create: async (tripData) => {
    const [result] = await db.query(
      'INSERT INTO trips SET ?',
      [tripData]
    );
    return result;
  },

  // ✅ GET ALL TRIPS (exclude soft-deleted)
getAll: async () => {
  const [rows] = await db.query(`
    SELECT 
      t.*,
      COALESCE(d.full_name, t.driver_name) AS driver_name,
      s.full_name AS supervisor_name,
      st.station_name
    FROM trips t
    LEFT JOIN drivers d ON t.driver_id = d.id
    LEFT JOIN supervisors s ON t.supervisor_id = s.id
    LEFT JOIN stations st ON t.station_id = st.id
    WHERE t.is_deleted = 0
    ORDER BY t.created_at DESC
  `);
  return rows;
},
  // ✅ GET SINGLE TRIP (exclude soft-deleted)
getById: async (tripId) => {
  const [rows] = await db.query(`
    SELECT 
      t.*,
      COALESCE(d.full_name, t.driver_name) AS driver_name,
      s.full_name AS supervisor_name,
      st.station_name
    FROM trips t
    LEFT JOIN drivers d ON t.driver_id = d.id
    LEFT JOIN supervisors s ON t.supervisor_id = s.id
    LEFT JOIN stations st ON t.station_id = st.id
    WHERE t.trip_id = ? AND t.is_deleted = 0
  `, [tripId]);
  return rows[0];
},


// 🔥 ADD EXPENSE
addExpense: async (tripId, expenseData) => {
  const { amount, type, notes } = expenseData;

  const [result] = await db.query(
    `INSERT INTO trip_expenses (trip_id, amount, type, notes)
     VALUES (?, ?, ?, ?)`,
    [
      tripId,
      amount || 0,
      type || 'Misc',
      notes || ''
    ]
  );

  return result;
},

updateExpense: async (tripId, expenseId, expenseData) => {
  const { amount, type, notes } = expenseData;
  const [[trip]] = await db.query(
    `SELECT id, trip_id AS trip_code FROM trips WHERE id = ? OR trip_id = ? LIMIT 1`,
    [tripId, tripId]
  );
  const tripKeys = [tripId, trip?.id, trip?.trip_code]
    .filter(value => value !== undefined && value !== null)
    .map(value => String(value));
  const [result] = await db.query(
    `UPDATE trip_expenses SET amount=?, type=?, notes=? WHERE id=? AND trip_id IN (${tripKeys.map(() => '?').join(',')})`,
    [amount || 0, type || 'Misc', notes || '', expenseId, ...tripKeys]
  );
  return result;
},

deleteExpense: async (tripId, expenseId) => {
  const [[trip]] = await db.query(
    `SELECT id, trip_id AS trip_code FROM trips WHERE id = ? OR trip_id = ? LIMIT 1`,
    [tripId, tripId]
  );
  const tripKeys = [tripId, trip?.id, trip?.trip_code]
    .filter(value => value !== undefined && value !== null)
    .map(value => String(value));
  const [result] = await db.query(
    `DELETE FROM trip_expenses WHERE id=? AND trip_id IN (${tripKeys.map(() => '?').join(',')})`,
    [expenseId, ...tripKeys]
  );
  return result;
},

// 🔥 ADD FUEL
addFuel: async (tripId, fuelData) => {
  const { quantity, rate, vendor } = fuelData;

  const [result] = await db.query(
    `INSERT INTO trip_fuel (trip_id, quantity, rate, vendor)
     VALUES (?, ?, ?, ?)`,
    [
      tripId,
      quantity || 0,
      rate || 0,
      vendor || ''
    ]
  );

  return result;
},

// 🔥 NEW
getExpenses: async (tripId) => {
  const [rows] = await db.query(
    'SELECT * FROM trip_expenses WHERE trip_id = ? ORDER BY created_at DESC',
    [tripId]
  );
  return rows;
},

getFuel: async (tripId) => {
  const [rows] = await db.query(
    'SELECT * FROM trip_fuel WHERE trip_id = ? ORDER BY created_at DESC',
    [tripId]
  );
  return rows;
},


  // ✅ UPDATE TRIP
  update: async (id, tripData) => {
    const [result] = await db.query(
      'UPDATE trips SET ? WHERE trip_id = ?',
      [tripData, id]
    );
    return result;
  },

  // ✅ SOFT DELETE TRIP
  softDelete: async (id) => {
    const [result] = await db.query(
      `UPDATE trips SET is_deleted = 1, deleted_at = NOW() WHERE trip_id = ?`,
      [id]
    );
    return result;
  },

  // ✅ GET BY ID (including soft-deleted, for internal use)
  getByIdAny: async (tripId) => {
    const [rows] = await db.query(
      `SELECT t.*, COALESCE(d.full_name, t.driver_name) AS driver_name,
              s.full_name AS supervisor_name, st.station_name
       FROM trips t
       LEFT JOIN drivers d ON t.driver_id = d.id
       LEFT JOIN supervisors s ON t.supervisor_id = s.id
       LEFT JOIN stations st ON t.station_id = st.id
       WHERE t.trip_id = ?`,
      [tripId]
    );
    return rows[0];
  },

};

module.exports = Trip;