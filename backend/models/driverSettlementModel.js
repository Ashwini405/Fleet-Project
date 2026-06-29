const db = require("../config/db");

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

  return rows[0];
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

// =====================================
// Mark Settlement Paid
// =====================================
const markSettlementPaid = async (
  id,
  paymentData
) => {

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
      paymentData.payment_mode || paymentData.payment_method || null,
      paymentData.payment_ref || paymentData.payment_reference || null,
      paymentData.payment_date || null,
      paymentData.payment_notes || null,
      id
    ]
  );
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
  getDriverDetails,
  createSettlement,
  getSettlements,
  getPendingSettlements,
  approveSettlement,
  rejectSettlement,
  markSettlementPaid,
  duplicateSettlement
};