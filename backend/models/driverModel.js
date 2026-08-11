const db = require('../config/db');

const Driver = {

  // ================= CREATE DRIVER =================
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO drivers
      (
        full_name,
        mobile,
        id_card_number,
        license_no,
        joining_date,
        status,
        address,
        station_id,
        vehicle_id,
        bank_name,
        account_number,
        ifsc_code,
        profile_photo,
        id_document,
        bank_document
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.license_no || null,
        data.joining_date || null,
        data.status,
        data.address,
        data.station_id || null,
        data.vehicle_id || null,
        data.bank_name,
        data.account_number,
        data.ifsc_code,
        // frontend/multer field is named `id_proof`; DB column is `id_document`
        data.profile_photo || null,
        data.id_proof || null,
        data.bank_document || null
      ]
    );

    return result;
  },

  // ================= GET DRIVER BY ID =================
  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM drivers WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  // ================= UPDATE DRIVER =================
  update: async (id, data) => {
    const fields = [
      'full_name = ?',
      'mobile = ?',
      'id_card_number = ?',
      'license_no = ?',
      'joining_date = ?',
      'status = ?',
      'address = ?',
      'station_id = ?',
      'vehicle_id = ?',
      'bank_name = ?',
      'account_number = ?',
      'ifsc_code = ?'
    ];

    const params = [
      data.full_name,
      data.mobile,
      data.id_card_number,
      data.license_no || null,
      data.joining_date || null,
      data.status,
      data.address,
      data.station_id || null,
      data.vehicle_id || null,
      data.bank_name,
      data.account_number,
      data.ifsc_code
    ];

    // Only overwrite uploaded documents when a new file was actually provided
    if (data.profile_photo) {
      fields.push('profile_photo = ?');
      params.push(data.profile_photo);
    }
    if (data.id_proof) {
      fields.push('id_document = ?');
      params.push(data.id_proof);
    }
    if (data.bank_document) {
      fields.push('bank_document = ?');
      params.push(data.bank_document);
    }

    params.push(id);

    const [result] = await db.query(
      `UPDATE drivers SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return result;
  },

  // ================= GET ALL DRIVERS =================
  getAll: async () => {

    const [rows] = await db.query(`
      SELECT
        d.*,
        s.station_name,
        v.vehicle_no
      FROM drivers d
      LEFT JOIN stations s
        ON d.station_id = s.id
      LEFT JOIN vehicles v
        ON d.vehicle_id = v.id
      ORDER BY d.created_at DESC
    `);

    return rows;
  },

  // ================= DRIVER PROFILE =================
  getProfile: async (id) => {

    // Driver Details
    const [driverRows] = await db.query(`
      SELECT
        d.*,
        s.station_name,
        v.vehicle_no
      FROM drivers d
      LEFT JOIN stations s
        ON d.station_id = s.id
      LEFT JOIN vehicles v
        ON d.vehicle_id = v.id
      WHERE d.id = ?
    `, [id]);

    // Trips
    const [tripRows] = await db.query(`
      SELECT *
      FROM trips
      WHERE driver_id = ?
      ORDER BY trip_date DESC
    `, [id]);

    // Settlements / Payments
    const [paymentRows] = await db.query(`
      SELECT *
      FROM driver_settlements
      WHERE driver_id = ?
      ORDER BY created_at DESC
    `, [id]);

    // Manual (non-trip) advances
    const [otherAdvanceRows] = await db.query(`
      SELECT *
      FROM driver_advances
      WHERE driver_id = ?
      ORDER BY advance_date DESC, id DESC
    `, [id]);

    // Months that already have a settlement raised (advance was accounted for)
    const settledMonths = new Set(paymentRows.map(p => p.statement_month));

    // Trip advances come from the trips table itself
    const tripAdvances = tripRows
      .filter(t => Number(t.driver_advance) > 0)
      .map(t => {
        const month = t.trip_date
          ? new Date(t.trip_date).toISOString().slice(0, 7)
          : null;

        return {
          id: `trip-${t.id}`,
          type: 'Trip',
          advance_date: t.trip_date,
          amount: t.driver_advance,
          reason: `Trip ${t.trip_id || t.id}: ${t.source || '—'} → ${t.destination || '—'}`,
          status: month && settledMonths.has(month) ? 'Included in Settlement' : 'Pending Settlement'
        };
      });

    const otherAdvances = otherAdvanceRows.map(a => ({
      id: `other-${a.id}`,
      type: 'Other',
      advance_date: a.advance_date,
      amount: a.amount,
      reason: a.reason,
      status: a.status === 'recovered' ? 'Recovered' : 'Outstanding'
    }));

    const advances = [...tripAdvances, ...otherAdvances].sort(
      (a, b) => new Date(b.advance_date) - new Date(a.advance_date)
    );

    return {
      driver: driverRows[0],
      trips: tripRows,
      payments: paymentRows,
      advances
    };
  },

  // ================= DELETE DRIVER =================
  delete: async (id) => {

    const [result] = await db.query(
      "DELETE FROM drivers WHERE id = ?",
      [id]
    );

    return result;
  }

};

module.exports = Driver;