const db = require('../config/db');

// ── CREATE BATTERY (inventory) ────────────────────────────────────────────────
const createBattery = async (data) => {
  const warrantyExpiry = data.warranty_expiry ||
    (data.purchase_date && data.warranty_period_months
      ? (() => {
          const d = new Date(data.purchase_date);
          d.setMonth(d.getMonth() + parseInt(data.warranty_period_months));
          return d.toISOString().split('T')[0];
        })()
      : null);

  const [result] = await db.query(
    `INSERT INTO batteries
     (serial_number, barcode, brand, model, capacity_ah, voltage, battery_type,
      purchase_date, warranty_period_months, warranty_expiry, vendor, purchase_cost,
      status, location, compatible_vehicle_types, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.serial_number, data.barcode || null, data.brand, data.model,
      data.capacity_ah || null, data.voltage || null, data.battery_type || 'Dry',
      data.purchase_date || null, data.warranty_period_months || null,
      warrantyExpiry, data.vendor || null, data.purchase_cost || 0,
      data.status || 'In Stock', data.location || 'Warehouse',
      data.compatible_vehicle_types || null, data.notes || null
    ]
  );
  return result;
};

// ── GET ALL BATTERIES ─────────────────────────────────────────────────────────
const getAllBatteries = async () => {
  const [rows] = await db.query(`SELECT * FROM batteries ORDER BY created_at DESC`);
  return rows;
};

// ── GET AVAILABLE (In Stock) BATTERIES ───────────────────────────────────────
const getAvailableBatteries = async () => {
  const [rows] = await db.query(
    `SELECT * FROM batteries WHERE status = 'In Stock' ORDER BY created_at DESC`
  );
  return rows;
};

// ── GET BATTERY BY ID ─────────────────────────────────────────────────────────
const getBatteryById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM batteries WHERE id = ?`, [id]);
  return rows[0];
};

// ── INSTALL BATTERY TO VEHICLE (atomic) ──────────────────────────────────────
const installBattery = async (data) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Validate battery is In Stock
    const [[battery]] = await conn.query(
      `SELECT * FROM batteries WHERE id = ? AND status = 'In Stock'`, [data.battery_id]
    );
    if (!battery) throw new Error('Battery not available in stock');

    // Check vehicle doesn't already have an active battery
    const [[existing]] = await conn.query(
      `SELECT id FROM battery_installations WHERE vehicle_id = ? AND removed_date IS NULL`,
      [data.vehicle_id]
    );
    if (existing) throw new Error('Vehicle already has an active battery. Replace it first.');

    // Create installation record
    await conn.query(
      `INSERT INTO battery_installations
       (battery_id, vehicle_id, install_date, install_odometer, technician, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.battery_id, data.vehicle_id, data.install_date, data.install_odometer || 0,
       data.technician || null, data.notes || null]
    );

    // Update battery status
    await conn.query(
      `UPDATE batteries SET status = 'Installed', location = 'Installed Vehicle',
       vehicle_id = ? WHERE id = ?`,
      [data.vehicle_id, data.battery_id]
    );

    // Log history
    await conn.query(
      `INSERT INTO battery_history
       (battery_id, vehicle_id, event_type, event_date, odometer, technician, notes)
       VALUES (?, ?, 'Installed', ?, ?, ?, ?)`,
      [data.battery_id, data.vehicle_id, data.install_date,
       data.install_odometer || 0, data.technician || null, data.notes || null]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ── REPLACE BATTERY ───────────────────────────────────────────────────────────
const replaceBattery = async (data) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get active installation
    const [[installation]] = await conn.query(
      `SELECT bi.*, b.serial_number FROM battery_installations bi
       JOIN batteries b ON b.id = bi.battery_id
       WHERE bi.vehicle_id = ? AND bi.removed_date IS NULL`,
      [data.vehicle_id]
    );
    if (!installation) throw new Error('No active battery found on this vehicle');

    const removalDate = data.removal_date || new Date().toISOString().split('T')[0];
    const runningKm = Math.max(0, (data.removal_odometer || 0) - (installation.install_odometer || 0));

    // Close old installation
    await conn.query(
      `UPDATE battery_installations
       SET removed_date = ?, removal_odometer = ?, failure_reason = ?,
           warranty_claim = ?, old_battery_decision = ?, running_km = ?
       WHERE id = ?`,
      [removalDate, data.removal_odometer || 0, data.failure_reason || null,
       data.warranty_claim ? 1 : 0, data.old_battery_decision || 'Scrap',
       runningKm, installation.id]
    );

    // Update old battery status
    const oldStatus = data.warranty_claim ? 'Warranty Claim'
      : data.old_battery_decision === 'Scrap' ? 'Scrap'
      : data.old_battery_decision === 'Return Vendor' ? 'Return Vendor'
      : data.old_battery_decision === 'Store' ? 'Store'
      : 'Failed';
    const oldLocation = data.old_battery_decision === 'Store' ? 'Store'
      : data.old_battery_decision === 'Return Vendor' ? 'Vendor'
      : 'Workshop';
    await conn.query(
      `UPDATE batteries SET status = ?, location = ?, vehicle_id = NULL WHERE id = ?`,
      [oldStatus, oldLocation, installation.battery_id]
    );

    // Log removal history
    await conn.query(
      `INSERT INTO battery_history
       (battery_id, vehicle_id, event_type, event_date, odometer, failure_reason, warranty_claim, running_km, notes)
       VALUES (?, ?, 'Removed', ?, ?, ?, ?, ?, ?)`,
      [installation.battery_id, data.vehicle_id, removalDate,
       data.removal_odometer || 0, data.failure_reason || null,
       data.warranty_claim ? 1 : 0, runningKm, data.notes || null]
    );

    // Install new battery if provided
    if (data.new_battery_id) {
      const [[newBattery]] = await conn.query(
        `SELECT * FROM batteries WHERE id = ? AND status = 'In Stock'`, [data.new_battery_id]
      );
      if (!newBattery) throw new Error('Replacement battery not available in stock');

      await conn.query(
        `INSERT INTO battery_installations
         (battery_id, vehicle_id, install_date, install_odometer, technician, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.new_battery_id, data.vehicle_id, removalDate,
         data.removal_odometer || 0, data.technician || null, 'Replacement battery']
      );

      await conn.query(
        `UPDATE batteries SET status = 'Installed', location = 'Installed Vehicle',
         vehicle_id = ? WHERE id = ?`,
        [data.vehicle_id, data.new_battery_id]
      );

      await conn.query(
        `INSERT INTO battery_history
         (battery_id, vehicle_id, event_type, event_date, odometer, technician, notes)
         VALUES (?, ?, 'Installed', ?, ?, ?, 'Replacement')`,
        [data.new_battery_id, data.vehicle_id, removalDate,
         data.removal_odometer || 0, data.technician || null]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ── GET ACTIVE BATTERY FOR VEHICLE ───────────────────────────────────────────
const getVehicleActiveBattery = async (vehicleId) => {
  const [rows] = await db.query(
    `SELECT b.*, bi.install_date, bi.install_odometer, bi.technician,
            bi.id AS installation_id
     FROM battery_installations bi
     JOIN batteries b ON b.id = bi.battery_id
     WHERE bi.vehicle_id = ? AND bi.removed_date IS NULL`,
    [vehicleId]
  );
  return rows[0] || null;
};

// ── GET BATTERY HISTORY FOR VEHICLE ──────────────────────────────────────────
const getVehicleBatteryHistory = async (vehicleId) => {
  const [rows] = await db.query(
    `SELECT bi.*, b.serial_number, b.brand, b.model, b.capacity_ah, b.voltage,
            b.battery_type, b.warranty_expiry, b.purchase_cost
     FROM battery_installations bi
     JOIN batteries b ON b.id = bi.battery_id
     WHERE bi.vehicle_id = ?
     ORDER BY bi.install_date DESC`,
    [vehicleId]
  );
  return rows;
};

// ── GET BATTERY LIFECYCLE HISTORY ────────────────────────────────────────────
const getBatteryHistory = async (batteryId) => {
  const [rows] = await db.query(
    `SELECT bh.*, v.vehicle_no
     FROM battery_history bh
     LEFT JOIN vehicles v ON v.id = bh.vehicle_id
     WHERE bh.battery_id = ?
     ORDER BY bh.event_date DESC`,
    [batteryId]
  );
  return rows;
};

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
const getDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM batteries`);
  const [[{ active }]] = await db.query(`SELECT COUNT(*) AS active FROM batteries WHERE status = 'Installed'`);
  const [[{ in_stock }]] = await db.query(`SELECT COUNT(*) AS in_stock FROM batteries WHERE status = 'In Stock'`);
  const [[{ expiring }]] = await db.query(
    `SELECT COUNT(*) AS expiring FROM batteries
     WHERE warranty_expiry BETWEEN ? AND ? AND status NOT IN ('Scrap','Failed')`,
    [today, in30Days]
  );
  const [[{ expired }]] = await db.query(
    `SELECT COUNT(*) AS expired FROM batteries WHERE warranty_expiry < ? AND status NOT IN ('Scrap','Failed')`,
    [today]
  );
  const [[{ failed }]] = await db.query(`SELECT COUNT(*) AS failed FROM batteries WHERE status = 'Failed'`);
  const [[{ warranty_claims }]] = await db.query(`SELECT COUNT(*) AS warranty_claims FROM batteries WHERE status = 'Warranty Claim'`);

  return { total, active, in_stock, expiring, expired, failed, warranty_claims };
};

// ── UPDATE BATTERY ────────────────────────────────────────────────────────────
const updateBattery = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  const [result] = await db.query(`UPDATE batteries SET ${fields} WHERE id = ?`, values);
  return result;
};

// ── ANALYTICS ────────────────────────────────────────────────────────────────
const getAnalytics = async () => {
  const [vendorPerf] = await db.query(
    `SELECT b.vendor,
            COUNT(*) AS total,
            SUM(CASE WHEN b.status = 'Failed' THEN 1 ELSE 0 END) AS failed,
            AVG(bi.running_km) AS avg_km,
            SUM(b.purchase_cost) AS total_cost
     FROM batteries b
     LEFT JOIN battery_installations bi ON bi.battery_id = b.id AND bi.removed_date IS NOT NULL
     WHERE b.vendor IS NOT NULL
     GROUP BY b.vendor ORDER BY failed DESC`
  );

  const [vehicleReplacements] = await db.query(
    `SELECT v.vehicle_no, COUNT(bi.id) AS replacements
     FROM battery_installations bi
     JOIN vehicles v ON v.id = bi.vehicle_id
     WHERE bi.removed_date IS NOT NULL
     GROUP BY bi.vehicle_id ORDER BY replacements DESC LIMIT 10`
  );

  return { vendorPerf, vehicleReplacements };
};

module.exports = {
  createBattery, getAllBatteries, getAvailableBatteries, getBatteryById,
  installBattery, replaceBattery, getVehicleActiveBattery, getVehicleBatteryHistory,
  getBatteryHistory, getDashboardStats, updateBattery, getAnalytics
};
