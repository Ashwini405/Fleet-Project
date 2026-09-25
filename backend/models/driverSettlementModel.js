const db = require("../config/db");
const driverAdvanceModel = require("./driverAdvanceModel");

// =====================================
// Get Plants
// =====================================
const getPlants = async () => {
  const [rows] = await db.query(`
    SELECT DISTINCT
      source_plant
    FROM trips
    WHERE source_plant IS NOT NULL
      AND source_plant <> ''
    ORDER BY source_plant
  `);

  return rows;
};

// =====================================
// Get Vehicles By Plant
// =====================================
const getVehiclesByPlant = async (plant) => {
  const [rows] = await db.query(
    `
    SELECT DISTINCT
      v.id AS vehicle_id,
      v.vehicle_no
    FROM vehicles v
    INNER JOIN trips t
      ON v.vehicle_no = t.truck_no
    WHERE t.source_plant = ?
    ORDER BY v.vehicle_no
    `,
    [plant]
  );

  return rows;
};

// =====================================
// Get Driver By Vehicle
// =====================================
const getDriverByVehicle = async (vehicleNo) => {
  const [rows] = await db.query(
    `
    SELECT
      d.id AS driver_id,
      d.full_name AS driver_name,
      v.id AS vehicle_id
    FROM vehicles v
    LEFT JOIN drivers d
      ON d.id = v.assigned_driver
    WHERE v.vehicle_no = ?
    `,
    [vehicleNo]
  );

  return rows[0];
};

// =====================================
// Get Driver By ID Direct (with vehicle & plant resolution)
// =====================================
const getDriverById = async (driverId) => {
  const [rows] = await db.query(
    `
    SELECT
      d.id AS driver_id,
      d.full_name AS driver_name,
      d.station_id,
      s.station_name AS plant_name,
      COALESCE(v.id, (SELECT vehicle_id FROM trips WHERE driver_id = d.id AND vehicle_id IS NOT NULL ORDER BY trip_date DESC, id DESC LIMIT 1)) AS vehicle_id,
      COALESCE(v.vehicle_no, (SELECT truck_no FROM trips WHERE driver_id = d.id AND truck_no IS NOT NULL AND truck_no <> '' ORDER BY trip_date DESC, id DESC LIMIT 1)) AS vehicle_no,
      COALESCE(s.station_name, (SELECT source_plant FROM trips WHERE driver_id = d.id AND source_plant IS NOT NULL AND source_plant <> '' ORDER BY trip_date DESC, id DESC LIMIT 1)) AS source_plant
    FROM drivers d
    LEFT JOIN stations s ON d.station_id = s.id
    LEFT JOIN vehicles v ON (v.assigned_driver = d.id OR d.vehicle_id = v.id)
    WHERE d.id = ?
    LIMIT 1
    `,
    [driverId]
  );

  return rows[0];
};

// =====================================
// Get All Active Drivers for Settlement Dropdown
// =====================================
const getAllSettlementDrivers = async () => {
  const [rows] = await db.query(`
    SELECT
      d.id AS driver_id,
      d.full_name AS driver_name,
      d.station_id,
      COALESCE(s.station_name, (SELECT source_plant FROM trips WHERE driver_id = d.id AND source_plant IS NOT NULL AND source_plant <> '' ORDER BY trip_date DESC, id DESC LIMIT 1)) AS plant_name,
      COALESCE((SELECT vehicle_no FROM vehicles WHERE assigned_driver = d.id LIMIT 1), (SELECT truck_no FROM trips WHERE driver_id = d.id AND truck_no IS NOT NULL AND truck_no <> '' ORDER BY trip_date DESC, id DESC LIMIT 1)) AS vehicle_no
    FROM drivers d
    LEFT JOIN stations s ON d.station_id = s.id
    WHERE d.status = 'Active' OR d.status IS NULL
    GROUP BY d.id
    ORDER BY d.full_name ASC
  `);

  return rows;
};


// =====================================
// Get Driver Trip Details
// =====================================
const getDriverDetails = async (
  driverId,
  month
) => {

  const [rows] = await db.query(
    `
    SELECT
      COUNT(*) AS total_trips,

      COALESCE(
        SUM(driver_advance),
        0
      ) AS total_advance

    FROM trips

    WHERE driver_id = ?

    AND DATE_FORMAT(
      trip_date,
      '%Y-%m'
    ) = ?
    `,
    [
      driverId,
      month
    ]
  );

  // Any manually-given ("Other") advances still outstanding are also due
  // for recovery, regardless of which month they were given in.
  const outstandingOther = await driverAdvanceModel.getOutstandingTotal(driverId);

  return {
    ...rows[0],
    total_advance: Number(rows[0].total_advance) + outstandingOther
  };
};

// =====================================
// Create Settlement
// =====================================
const createSettlement = async (data) => {

  const [result] = await db.query(
    `
    INSERT INTO driver_settlements
    (
      settlement_no,
      plant_name,
      vehicle_id,
      vehicle_no,
      driver_id,
      driver_name,
      statement_month,
      fixed_salary,
      battha_rate,
      total_trips,
      total_battha,
      total_earnings,
      loading_charges,
      unloading_charges,
      bonus,
      other_allowances,
      total_additions,
      driver_advance,
      penalty,
      penalty_reason,
      other_deductions,
      other_deduction_reason,
      total_deductions,
      net_payable,
      status
    )
    VALUES
    (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
    `,
    [
      data.settlement_no,
      data.plant_name,
      data.vehicle_id,
      data.vehicle_no,
      data.driver_id,
      data.driver_name,
      data.statement_month,
      data.fixed_salary,
      data.battha_rate,
      data.total_trips,
      data.total_battha,
      data.total_earnings,
      data.loading_charges,
      data.unloading_charges,
      data.bonus,
      data.other_allowances,
      data.total_additions,
      data.driver_advance,
      data.penalty,
      data.penalty_reason,
      data.other_deductions,
      data.other_deduction_reason,
      data.total_deductions,
      data.net_payable,
      data.status || "Draft"
    ]
  );

  return result;
};

// =====================================
// Get All Settlements
// =====================================
const getSettlements = async () => {

  const [rows] = await db.query(`
    SELECT *
    FROM driver_settlements
    ORDER BY created_at DESC
  `);

  return rows;
};

// =====================================
// Get Pending Settlements
// =====================================
const getPendingSettlements = async () => {

  const [rows] = await db.query(`
    SELECT *
    FROM driver_settlements
    WHERE status = 'Submitted'
    ORDER BY created_at DESC
  `);

  return rows;
};


// =====================================
// Approve Settlement
// =====================================
const approveSettlement = async (id) => {

  await db.query(
    `
    UPDATE driver_settlements
    SET
      status = 'Approved',
      approved_date = CURDATE()
    WHERE id = ?
    `,
    [id]
  );
};

// =====================================
// Reject Settlement
// =====================================
const rejectSettlement = async (
  id,
  reason
) => {

  await db.query(
    `
    UPDATE driver_settlements
    SET
      status = 'Rejected',
      rejected_reason = ?
    WHERE id = ?
    `,
    [
      reason || '',
      id
    ]
  );
};

const markSettlementPaid = async (
  id,
  paymentData
) => {
  const paymentMode = paymentData.payment_mode || paymentData.payment_method || 'Bank Transfer';
  const paymentRef = paymentData.payment_ref || paymentData.payment_reference || '';
  const paymentDate = paymentData.payment_date || new Date().toISOString().slice(0, 10);
  const paymentNotes = paymentData.payment_notes || '';

  await db.query(
    `
    UPDATE driver_settlements
    SET
      status = 'Paid',
      payment_method = ?,
      payment_reference = ?,
      payment_date = ?,
      payment_notes = ?
    WHERE id = ?
    `,
    [
      paymentMode,
      paymentRef,
      paymentDate,
      paymentNotes,
      id
    ]
  );

  // Fetch settlement details
  const [rows] = await db.query(
    `SELECT * FROM driver_settlements WHERE id = ?`,
    [id]
  );

  if (rows[0]) {
    const s = rows[0];
    if (s.driver_id) {
      try {
        await driverAdvanceModel.markRecovered(s.driver_id, id);
      } catch (advErr) {
        console.error('Error clearing driver advance:', advErr.message);
      }
    }

    // Record into company expense_entries
    try {
      const expNum = `EXP-DRV-${s.id}-${Date.now().toString().slice(-4)}`;
      await db.query(`
        INSERT INTO expense_entries (
          expense_number,
          expense_category,
          expense_title,
          vehicle_id,
          vehicle_number,
          driver_id,
          driver_name,
          station_name,
          expense_date,
          amount,
          payment_method,
          payment_status,
          vendor_payee,
          description,
          salary_month,
          salary_type,
          salary_payment_mode,
          entry_status,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Driver', ?, 'Approved', 'Driver Payroll')
      `, [
        expNum,
        'Driver Settlement',
        `Driver Settlement for ${s.driver_name || 'Driver'} (${s.statement_month || ''})`,
        s.vehicle_id || null,
        s.vehicle_no || null,
        s.driver_id || null,
        s.driver_name || null,
        s.plant_name || 'Main Plant',
        paymentDate,
        s.net_payable,
        paymentMode,
        'Paid',
        s.driver_name || 'Driver',
        `Settlement #${s.settlement_no}, Vehicle: ${s.vehicle_no}, Month: ${s.statement_month}. Ref: ${paymentRef || 'N/A'}. ${paymentNotes || ''}`,
        s.statement_month,
        paymentMode
      ]);
    } catch (expErr) {
      console.error('Error logging driver settlement into expense_entries:', expErr.message);
    }
  }
};

// =====================================
// Duplicate Settlement
// =====================================
const duplicateSettlement = async (
  id
) => {

  await db.query(
    `
    INSERT INTO driver_settlements
    (
      plant_name,
      vehicle_id,
      vehicle_no,
      driver_id,
      driver_name,
      statement_month,
      fixed_salary,
      battha_rate,
      total_trips,
      total_battha,
      total_earnings,
      loading_charges,
      unloading_charges,
      bonus,
      other_allowances,
      total_additions,
      driver_advance,
      penalty,
      other_deductions,
      total_deductions,
      net_payable,
      status
    )
    SELECT
      plant_name,
      vehicle_id,
      vehicle_no,
      driver_id,
      driver_name,
      statement_month,
      fixed_salary,
      battha_rate,
      total_trips,
      total_battha,
      total_earnings,
      loading_charges,
      unloading_charges,
      bonus,
      other_allowances,
      total_additions,
      driver_advance,
      penalty,
      other_deductions,
      total_deductions,
      net_payable,
      'Draft'
    FROM driver_settlements
    WHERE id = ?
    `,
    [id]
  );
};
module.exports = {
  getPlants,
  getVehiclesByPlant,
  getDriverByVehicle,
  getDriverById,
  getAllSettlementDrivers,
  getDriverDetails,
  createSettlement,
  getSettlements,
  getPendingSettlements,
  approveSettlement,
  rejectSettlement,
  markSettlementPaid,
  duplicateSettlement
};