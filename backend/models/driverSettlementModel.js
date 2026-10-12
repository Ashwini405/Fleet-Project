const db = require("../config/db");
const driverAdvanceModel = require("./driverAdvanceModel");

// =====================================
// Get Plants
// =====================================
const getPlants = async () => {
  // Plants trips started from, plus the stations trucks are assigned to — so
  // a truck with no trip yet can still get its salary sheet.
  const [rows] = await db.query(`
    SELECT source_plant FROM (
      SELECT source_plant
      FROM trips
      WHERE source_plant IS NOT NULL AND source_plant <> ''
        AND COALESCE(is_deleted, 0) = 0
      UNION
      SELECT st.station_name AS source_plant
      FROM vehicles v
      JOIN stations st ON st.id = v.station_id
      WHERE st.station_name IS NOT NULL AND st.station_name <> ''
    ) p
    ORDER BY source_plant
  `);

  return rows;
};

// =====================================
// Get Vehicles By Plant
// =====================================
const getVehiclesByPlant = async (plant) => {
  // Trucks assigned to this plant/station, and trucks that ran trips from it
  // (trips matched by vehicle id as well as by truck number).
  const [rows] = await db.query(
    `
    SELECT
      v.id AS vehicle_id,
      v.vehicle_no
    FROM vehicles v
    LEFT JOIN stations st ON st.id = v.station_id
    WHERE st.station_name = ?
       OR EXISTS (
         SELECT 1 FROM trips t
         WHERE t.source_plant = ?
           AND COALESCE(t.is_deleted, 0) = 0
           AND (t.vehicle_id = v.id OR t.truck_no = v.vehicle_no)
       )
    ORDER BY v.vehicle_no
    `,
    [plant, plant]
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

  // Battha counts real trips only: deleted, draft and cancelled trips are
  // left out. Advances of a cancelled trip were still handed over, so they
  // are still recovered.
  const [rows] = await db.query(
    `
    SELECT
      COALESCE(SUM(trip_status <> 'Cancelled'), 0) AS total_trips,

      COALESCE(
        SUM(driver_advance),
        0
      ) AS total_advance

    FROM trips

    WHERE driver_id = ?
      AND COALESCE(is_deleted, 0) = 0
      AND COALESCE(trip_status, '') <> 'Draft'

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
// Month details for the salary sheet: the truck's trips (and the driver's
// trips on other trucks) plus the truck's fuel and mileage for the month.
// =====================================
const getMonthDetails = async ({ vehicleNo, driverId, month }) => {
  const [[vehicle]] = await db.query(
    'SELECT id, vehicle_no, mileage FROM vehicles WHERE vehicle_no = ? LIMIT 1',
    [vehicleNo]
  );
  const vehicleId = vehicle?.id || null;

  const [trips] = await db.query(
    `
    SELECT
      t.id, t.trip_id, DATE_FORMAT(t.trip_date, '%Y-%m-%d') AS trip_date, t.trip_status,
      t.driver_id, COALESCE(d.full_name, t.driver_name) AS driver_name,
      t.vehicle_id, t.truck_no, COALESCE(t.source, t.source_plant) AS source, t.destination,
      t.est_distance, t.driver_advance, t.hamali_advance, t.other_advance
    FROM trips t
    LEFT JOIN drivers d ON d.id = t.driver_id
    WHERE COALESCE(t.is_deleted, 0) = 0
      AND COALESCE(t.trip_status, '') <> 'Draft'
      AND DATE_FORMAT(t.trip_date, '%Y-%m') = ?
      AND (t.vehicle_id = ? OR t.truck_no = ? OR (? IS NOT NULL AND t.driver_id = ?))
    ORDER BY t.trip_date ASC, t.id ASC
    `,
    [month, vehicleId, vehicleNo, driverId || null, driverId || null]
  );

  const [fuel] = await db.query(
    `
    SELECT
      f.id, DATE_FORMAT(f.date, '%Y-%m-%d') AS date, f.fuel_type, f.quantity, f.rate, f.total_cost,
      f.previous_odo, f.current_odo, f.distance, f.mileage, f.payment_method, f.vendor, f.full_tank,
      t.trip_id AS trip_code
    FROM fuel_entries f
    LEFT JOIN trips t ON t.id = f.trip_id
    WHERE (f.vehicle_id = ? OR (f.vehicle_id IS NULL AND f.vehicle_no = ?))
      AND DATE_FORMAT(f.date, '%Y-%m') = ?
    ORDER BY f.date ASC, f.id ASC
    `,
    [vehicleId, vehicleNo, month]
  );

  const tripRows = trips.map(t => ({
    ...t,
    est_distance: Number(t.est_distance) || 0,
    driver_advance: Number(t.driver_advance) || 0,
    hamali_advance: Number(t.hamali_advance) || 0,
    other_advance: Number(t.other_advance) || 0,
    on_this_truck: (vehicleId != null && t.vehicle_id === vehicleId) || t.truck_no === vehicleNo,
    // battha goes to the driver who did the trip; cancelled trips earn none
    counted: !!driverId && Number(t.driver_id) === Number(driverId) && t.trip_status !== 'Cancelled',
  }));

  const fuelRows = fuel.map(f => ({
    ...f,
    quantity: Number(f.quantity) || 0,
    rate: Number(f.rate) || 0,
    total_cost: Number(f.total_cost) || 0,
    distance: Number(f.distance) || 0,
    mileage: Number(f.mileage) || 0,
  }));

  // KM run = odometer range of the month's fills (reading before the first
  // fill → last reading); robust to a duplicated fill, unlike adding each
  // fill's distance. The litres of those fills cover exactly that range, so
  // mileage = KM run ÷ litres. AdBlue is not propulsion fuel and is left out.
  const propulsion = fuelRows.filter(f => f.fuel_type !== 'AdBlue');
  const fuelLitres = propulsion.reduce((s, f) => s + f.quantity, 0);
  const fuelCost = propulsion.reduce((s, f) => s + f.total_cost, 0);
  const withOdo = propulsion.filter(f => Number(f.current_odo) > 0);
  const odoStart = withOdo.length
    ? Math.min(...withOdo.map(f => (Number(f.previous_odo) > 0 ? Number(f.previous_odo) : Number(f.current_odo))))
    : 0;
  const odoEnd = withOdo.length ? Math.max(...withOdo.map(f => Number(f.current_odo))) : 0;
  const measuredKm = Math.max(odoEnd - odoStart, 0);
  const measuredLitres = measuredKm > 0 ? fuelLitres : 0;
  const avgMileage = measuredLitres > 0 ? measuredKm / measuredLitres : 0;
  const expectedMileage = Number(vehicle?.mileage) || 0;
  const expectedLitres = expectedMileage > 0 ? measuredKm / expectedMileage : 0;
  const excessLitres = expectedLitres > 0 && measuredLitres > expectedLitres ? measuredLitres - expectedLitres : 0;
  const avgRate = fuelLitres > 0 ? fuelCost / fuelLitres : 0;
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

  const truckTrips = tripRows.filter(t => t.on_this_truck);
  return {
    vehicle: { id: vehicleId, vehicle_no: vehicleNo, expected_mileage: expectedMileage },
    month,
    trips: tripRows,
    fuel: fuelRows,
    summary: {
      truck_trips: truckTrips.length,
      counted_trips: tripRows.filter(t => t.counted).length,
      other_driver_trips: truckTrips.filter(t => !t.counted && t.trip_status !== 'Cancelled').length,
      planned_km: truckTrips.reduce((s, t) => s + t.est_distance, 0),
      // same rule as the settlement's Driver Advance deduction (this driver's trips)
      trip_advances: tripRows.filter(t => driverId && Number(t.driver_id) === Number(driverId))
        .reduce((s, t) => s + t.driver_advance, 0),
      fills: fuelRows.length,
      fuel_litres: round(fuelLitres),
      fuel_cost: round(fuelCost),
      adblue_litres: round(fuelRows.filter(f => f.fuel_type === 'AdBlue').reduce((s, f) => s + f.quantity, 0)),
      km_run: round(measuredKm, 0),
      odo_start: odoStart,
      odo_end: odoEnd,
      avg_mileage: round(avgMileage),
      expected_mileage: expectedMileage,
      expected_litres: round(expectedLitres),
      excess_litres: round(excessLitres),
      excess_value: round(excessLitres * avgRate, 0),
    },
  };
};

// =====================================
// Create Settlement
// =====================================
const createSettlement = async (data) => {
  const insertQuery = `
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
    `;
  const values = [
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
  ];

  const yearPrefix = `SET-${new Date().getFullYear()}-`;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const [[sequenceRow]] = await db.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(settlement_no, '-', -1) AS UNSIGNED)), 0) AS last_sequence
       FROM driver_settlements
       WHERE settlement_no LIKE ?`,
      [`${yearPrefix}%`]
    );
    const sequence = Number(sequenceRow.last_sequence) + 1;
    const settlementNo = `${yearPrefix}${String(sequence).padStart(3, '0')}`;

    try {
      const [result] = await db.query(insertQuery, [settlementNo, ...values]);
      return { insertId: result.insertId, settlement_no: settlementNo };
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY' || attempt === 4) throw error;
    }
  }

  throw new Error('Unable to generate a unique settlement number');
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
  getMonthDetails,
  createSettlement,
  getSettlements,
  getPendingSettlements,
  approveSettlement,
  rejectSettlement,
  markSettlementPaid,
  duplicateSettlement
};