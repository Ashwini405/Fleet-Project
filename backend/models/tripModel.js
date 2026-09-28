const db = require('../config/db');

const tripIdentifierLookup = (tripId, alias = '') => {
  const prefix = alias ? `${alias}.` : '';
  if (/^\d+$/.test(String(tripId))) {
    return {
      where: `(${prefix}trip_id = ? OR ${prefix}id = ?)`,
      values: [tripId, tripId]
    };
  }
  return { where: `${prefix}trip_id = ?`, values: [tripId] };
};

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
  const lookup = tripIdentifierLookup(tripId, 't');
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
    WHERE ${lookup.where} AND t.is_deleted = 0
  `, lookup.values);
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
  const trip = await Trip.getByIdAny(tripId);
  const tripKeys = [tripId, trip?.id, trip?.trip_id]
    .filter(value => value !== undefined && value !== null)
    .map(value => String(value));
  const [result] = await db.query(
    `UPDATE trip_expenses SET amount=?, type=?, notes=? WHERE id=? AND trip_id IN (${tripKeys.map(() => '?').join(',')})`,
    [amount || 0, type || 'Misc', notes || '', expenseId, ...tripKeys]
  );
  return result;
},

deleteExpense: async (tripId, expenseId) => {
  const trip = await Trip.getByIdAny(tripId);
  const tripKeys = [tripId, trip?.id, trip?.trip_id]
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
    const lookup = tripIdentifierLookup(id);
    const [result] = await db.query(
      `UPDATE trips SET ? WHERE ${lookup.where}`,
      [tripData, ...lookup.values]
    );
    return result;
  },

  // ✅ SOFT DELETE TRIP
  softDelete: async (id) => {
    const lookup = tripIdentifierLookup(id);
    const [result] = await db.query(
      `UPDATE trips SET is_deleted = 1, deleted_at = NOW() WHERE ${lookup.where}`,
      lookup.values
    );
    return result;
  },

  // ✅ GET BY ID (including soft-deleted, for internal use)
  getByIdAny: async (tripId) => {
    const lookup = tripIdentifierLookup(tripId, 't');
    const [rows] = await db.query(
      `SELECT t.*, COALESCE(d.full_name, t.driver_name) AS driver_name,
              s.full_name AS supervisor_name, st.station_name
       FROM trips t
       LEFT JOIN drivers d ON t.driver_id = d.id
       LEFT JOIN supervisors s ON t.supervisor_id = s.id
       LEFT JOIN stations st ON t.station_id = st.id
      WHERE ${lookup.where}`,
          lookup.values
    );
    return rows[0];
  },

};

module.exports = Trip;