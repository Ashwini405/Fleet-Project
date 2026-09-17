const db = require('../config/db');

// Ensure wallet_balance column exists on drivers table and sync driver-vehicle assignments
(async () => {
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'drivers' AND COLUMN_NAME = 'wallet_balance'`
    );
    if (!cols.length) {
      await db.query(`ALTER TABLE drivers ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00`);
      console.log('drivers: added wallet_balance column');
    }

    // 1. If multiple vehicles point to same driver, keep only newest vehicle assignment
    await db.query(`
      UPDATE vehicles v
      JOIN (
        SELECT assigned_driver, MAX(id) AS keep_id
        FROM vehicles
        WHERE assigned_driver IS NOT NULL
        GROUP BY assigned_driver
        HAVING COUNT(*) > 1
      ) dup ON v.assigned_driver = dup.assigned_driver AND v.id <> dup.keep_id
      SET v.assigned_driver = NULL
    `);

    // 2. If multiple drivers point to same vehicle, keep only newest driver assignment
    await db.query(`
      UPDATE drivers d
      JOIN (
        SELECT vehicle_id, MAX(id) AS keep_id
        FROM drivers
        WHERE vehicle_id IS NOT NULL
        GROUP BY vehicle_id
        HAVING COUNT(*) > 1
      ) dup ON d.vehicle_id = dup.vehicle_id AND d.id <> dup.keep_id
      SET d.vehicle_id = NULL
    `);

    // 3. Sync drivers.vehicle_id -> vehicles.assigned_driver
    await db.query(`
      UPDATE vehicles v
      JOIN drivers d ON d.vehicle_id = v.id
      SET v.assigned_driver = d.id
      WHERE v.assigned_driver IS NULL OR v.assigned_driver <> d.id
    `);

    // 4. Sync vehicles.assigned_driver -> drivers.vehicle_id
    await db.query(`
      UPDATE drivers d
      JOIN vehicles v ON v.assigned_driver = d.id
      SET d.vehicle_id = v.id
      WHERE d.vehicle_id IS NULL OR d.vehicle_id <> v.id
    `);
  } catch (err) {
    console.error('drivers column check / assignment sync error:', err.message);
  }
})();

const Driver = {

  // ================= CREATE DRIVER =================
  create: async (data) => {
    const cleanVehicleId = data.vehicle_id && Number(data.vehicle_id) ? Number(data.vehicle_id) : null;
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
        wallet_balance,
        profile_photo,
        id_document,
        bank_document
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.license_no || null,
        data.joining_date || null,
        data.status,
        data.address,
        data.station_id || null,
        cleanVehicleId,
        data.bank_name,
        data.account_number,
        data.ifsc_code,
        data.wallet_balance !== undefined && data.wallet_balance !== '' ? data.wallet_balance : 0,
        // frontend/multer field is named `id_proof`; DB column is `id_document`
        data.profile_photo || null,
        data.id_proof || null,
        data.bank_document || null
      ]
    );

    const newDriverId = result.insertId;

    if (cleanVehicleId) {
      // Unassign any previous driver on this vehicle
      await db.query(
        "UPDATE drivers SET vehicle_id = NULL WHERE vehicle_id = ? AND id <> ?",
        [cleanVehicleId, newDriverId]
      );
      // Clear any other vehicle assigned to this driver
      await db.query(
        "UPDATE vehicles SET assigned_driver = NULL WHERE assigned_driver = ? AND id <> ?",
        [newDriverId, cleanVehicleId]
      );
      // Assign driver to vehicle
      await db.query(
        "UPDATE vehicles SET assigned_driver = ? WHERE id = ?",
        [newDriverId, cleanVehicleId]
      );
    }

    return result;
  },

  // ================= CHECK DUPLICATE DRIVER =================
  checkDuplicate: async ({ mobile, license_no, id_card_number, excludeId = null }) => {
    // Check by mobile
    if (mobile && String(mobile).trim()) {
      const cleanMobile = String(mobile).trim();
      let query = "SELECT id, full_name, mobile, license_no, id_card_number FROM drivers WHERE TRIM(mobile) = ?";
      const params = [cleanMobile];
      if (excludeId) {
        query += " AND id <> ?";
        params.push(excludeId);
      }
      const [rows] = await db.query(query, params);
      if (rows.length > 0) {
        return { isDuplicate: true, field: 'mobile', value: cleanMobile, driver: rows[0] };
      }
    }

    // Check by license_no
    if (license_no && String(license_no).trim()) {
      const cleanLicense = String(license_no).trim();
      let query = "SELECT id, full_name, mobile, license_no, id_card_number FROM drivers WHERE LOWER(TRIM(license_no)) = LOWER(?)";
      const params = [cleanLicense];
      if (excludeId) {
        query += " AND id <> ?";
        params.push(excludeId);
      }
      const [rows] = await db.query(query, params);
      if (rows.length > 0) {
        return { isDuplicate: true, field: 'license_no', value: cleanLicense, driver: rows[0] };
      }
    }

    // Check by id_card_number (Aadhaar / ID)
    if (id_card_number && String(id_card_number).trim()) {
      const cleanIdCard = String(id_card_number).trim();
      let query = "SELECT id, full_name, mobile, license_no, id_card_number FROM drivers WHERE LOWER(TRIM(id_card_number)) = LOWER(?)";
      const params = [cleanIdCard];
      if (excludeId) {
        query += " AND id <> ?";
        params.push(excludeId);
      }
      const [rows] = await db.query(query, params);
      if (rows.length > 0) {
        return { isDuplicate: true, field: 'id_card_number', value: cleanIdCard, driver: rows[0] };
      }
    }

    return { isDuplicate: false };
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
    const oldDriver = await Driver.getById(id);
    const oldVehicleId = oldDriver ? oldDriver.vehicle_id : null;
    const hasVehicleField = data.vehicle_id !== undefined;
    const newVehicleId = data.vehicle_id && Number(data.vehicle_id) ? Number(data.vehicle_id) : null;

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
      'ifsc_code = ?',
      'wallet_balance = ?'
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
      newVehicleId,
      data.bank_name,
      data.account_number,
      data.ifsc_code,
      data.wallet_balance !== undefined && data.wallet_balance !== '' ? data.wallet_balance : 0
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

    if (hasVehicleField) {
      if (newVehicleId) {
        // If driver was previously on a different vehicle, unassign old vehicle
        if (oldVehicleId && Number(oldVehicleId) !== Number(newVehicleId)) {
          await db.query(
            "UPDATE vehicles SET assigned_driver = NULL WHERE id = ? AND assigned_driver = ?",
            [oldVehicleId, id]
          );
        }
        // Unassign any other driver currently assigned to newVehicleId
        await db.query(
          "UPDATE drivers SET vehicle_id = NULL WHERE vehicle_id = ? AND id <> ?",
          [newVehicleId, id]
        );
        // Clear any other vehicle assigned to this driver
        await db.query(
          "UPDATE vehicles SET assigned_driver = NULL WHERE assigned_driver = ? AND id <> ?",
          [id, newVehicleId]
        );
        // Assign this driver to the new vehicle
        await db.query(
          "UPDATE vehicles SET assigned_driver = ? WHERE id = ?",
          [id, newVehicleId]
        );
      } else {
        // Driver unassigned from vehicle
        if (oldVehicleId) {
          await db.query(
            "UPDATE vehicles SET assigned_driver = NULL WHERE id = ? AND assigned_driver = ?",
            [oldVehicleId, id]
          );
        }
        await db.query(
          "UPDATE vehicles SET assigned_driver = NULL WHERE assigned_driver = ?",
          [id]
        );
      }
    }

    return result;
  },

  // ================= GET ALL DRIVERS =================
  getAll: async () => {

    const [rows] = await db.query(`
      SELECT
        d.*,
        s.station_name,
        COALESCE(v1.vehicle_no, v2.vehicle_no) AS vehicle_no,
        COALESCE(v1.vehicle_no, v2.vehicle_no) AS assigned_vehicle_no,
        COALESCE(d.vehicle_id, v2.id) AS assigned_vehicle_id
      FROM drivers d
      LEFT JOIN stations s
        ON d.station_id = s.id
      LEFT JOIN vehicles v1
        ON d.vehicle_id = v1.id
      LEFT JOIN vehicles v2
        ON v2.assigned_driver = d.id
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
        COALESCE(v1.vehicle_no, v2.vehicle_no) AS vehicle_no,
        COALESCE(d.vehicle_id, v2.id) AS vehicle_id
      FROM drivers d
      LEFT JOIN stations s
        ON d.station_id = s.id
      LEFT JOIN vehicles v1
        ON d.vehicle_id = v1.id
      LEFT JOIN vehicles v2
        ON v2.assigned_driver = d.id
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
      SELECT 
        ds.*,
        COALESCE(NULLIF(ds.vehicle_no, ''), v.vehicle_no) AS vehicle_no
      FROM driver_settlements ds
      LEFT JOIN vehicles v ON ds.vehicle_id = v.id
      WHERE ds.driver_id = ?
      ORDER BY ds.created_at DESC
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
          trip_db_id: t.id,
          trip_code: t.trip_id || t.id,
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
    // Clear vehicle assignment before deletion
    await db.query("UPDATE vehicles SET assigned_driver = NULL WHERE assigned_driver = ?", [id]);
    const [result] = await db.query(
      "DELETE FROM drivers WHERE id = ?",
      [id]
    );

    return result;
  }

};

module.exports = Driver;