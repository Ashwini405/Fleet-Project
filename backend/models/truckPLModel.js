const db = require("../config/db");

// ============================================
// Get Truck Header Information
// ============================================
const getTruckInfo = async (vehicleId) => {

  const [rows] = await db.query(
    `
    SELECT

      v.id,
      v.vehicle_no,
      v.make_brand,
      v.vehicle_status,

      d.id AS driver_id,
      d.full_name,

      s.station_name

    FROM vehicles v

    LEFT JOIN drivers d
      ON d.id = v.assigned_driver

    LEFT JOIN stations s
      ON s.id = v.station_id

    WHERE v.id = ?
    `,
    [vehicleId]
  );

  return rows[0];
};


// ============================================
// Get Revenue
// ============================================
const getRevenue = async (vehicleId, startDate = null, endDate = null) => {

  const tripDateFilter = (startDate && endDate) ? " AND trip_date BETWEEN ? AND ?" : "";
  const incomeDateFilter = (startDate && endDate) ? " AND created_at BETWEEN ? AND ?" : "";

  // Trip Revenue
  const [tripRows] = await db.query(
    `
    SELECT
      id,
      trip_id,
      trip_date,
      source,
      destination,
      customer_name,
      freight_amount,
      est_distance,
      EXISTS (
        SELECT 1 FROM income_entries ie
        WHERE ie.trip_id = trips.id OR ie.trip_id = trips.trip_id
      ) AS has_income_record
    FROM trips
    WHERE vehicle_id = ?
    ${tripDateFilter}
    ORDER BY trip_date DESC
    `,
    tripDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  // Additional Income
  const [incomeRows] = await db.query(
    `
    SELECT
      id,
      income_category,
      amount,
      customer_name,
      freight_start_date,
      freight_end_date,
      rental_description,
      rental_start_date,
      rental_end_date,
      description,
      place_of_running,
      payment_received_date,
      trip_id
    FROM income_entries
    WHERE vehicle_id = ?
      ${incomeDateFilter}
    ORDER BY created_at DESC
    `,
    incomeDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const incomeByTrip = new Map();
  incomeRows
    .filter(row => !["Rental", "Rental Income"].includes(row.income_category) && row.trip_id !== null && row.trip_id !== undefined && row.trip_id !== "")
    .forEach(row => {
      const key = String(row.trip_id);
      incomeByTrip.set(key, (incomeByTrip.get(key) || 0) + Number(row.amount || 0));
    });

  const trips = tripRows.map(row => {
    const linkedIncome = incomeByTrip.get(String(row.id)) || incomeByTrip.get(String(row.trip_id));
    return {
      date: row.trip_date,
      route: `${row.source} → ${row.destination}`,
      type: "Freight",
      amount: Number(row.has_income_record ? linkedIncome || 0 : row.freight_amount || 0),
      distance: Number(row.est_distance || 0)
    };
  });

  const rental = incomeRows
    .filter(x => ["Rental", "Rental Income"].includes(x.income_category))
    .map(x => {
      const start = x.rental_start_date || x.freight_start_date || x.payment_received_date;
      const end = x.rental_end_date || start;
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;
      const duration = startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())
        ? Math.max(1, Math.floor((endDate - startDate) / 86400000) + 1)
        : null;

      return {
        date: start,
        client: x.customer_name || x.rental_description || x.description || "—",
        days: duration ? `${duration} day${duration === 1 ? "" : "s"}` : "—",
        amount: Number(x.amount)
      };
    });

  const other = incomeRows
    .filter(x => !["Rental", "Rental Income"].includes(x.income_category) && (x.trip_id === null || x.trip_id === undefined || x.trip_id === ""))
    .map(x => ({
      date: x.freight_start_date,
      category: x.income_category,
      description: x.description || x.rental_description || x.place_of_running || "No description provided",
      amount: Number(x.amount)
    }));

  const totalTripRevenue =
    trips.reduce((a, b) => a + b.amount, 0);

  const totalRentalRevenue =
    rental.reduce((a, b) => a + b.amount, 0);

  const totalOtherRevenue =
    other.reduce((a, b) => a + b.amount, 0);

  return {

    trips,

    rental,

    other,

    totals: {

      totalTripRevenue,

      totalRentalRevenue,

      totalOtherRevenue,

      totalRevenue:
        totalTripRevenue +
        totalRentalRevenue +
        totalOtherRevenue,
      completedTrips: tripRows.length,
      totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0)

    }

  };

};

// ============================================
// Get Fuel Expenses
// ============================================
const getFuel = async (vehicleId, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND date BETWEEN ? AND ?" : "";
  const manualDateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";

  const [rows] = await db.query(
    `
    SELECT
      date,
      station_name,
      vendor,
      quantity,
      rate,
      total_cost,
      fuel_type
    FROM fuel_entries
    WHERE vehicle_id = ?
    ${dateFilter}
    ORDER BY date DESC
    `,
    dateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const [manualRows] = await db.query(
    `SELECT expense_date AS date, vendor_payee, description, amount
     FROM expense_entries
     WHERE vehicle_id = ? AND expense_category = 'Fuel'
     ${manualDateFilter}`,
    manualDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const entries = rows.map(row => ({
    date: row.date,
    station: row.station_name || row.vendor || "—",
    litres: Number(row.quantity),
    rate: Number(row.rate),
    amount: Number(row.total_cost),
    fuelType: row.fuel_type
  }));

  manualRows.forEach(row => entries.push({
    date: row.date,
    station: row.vendor_payee || row.description || 'Manual fuel expense',
    litres: 0,
    rate: 0,
    amount: Number(row.amount || 0),
    fuelType: 'Diesel'
  }));

  const adBlueEntries = entries.filter(e => e.fuelType === 'AdBlue');
  const dieselEntries = entries.filter(e => e.fuelType !== 'AdBlue');

  const totalFuel = dieselEntries.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalLitres = dieselEntries.reduce(
    (sum, item) => sum + item.litres,
    0
  );

  const totalAdBlue = adBlueEntries.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalAdBlueLitres = adBlueEntries.reduce(
    (sum, item) => sum + item.litres,
    0
  );

  return {
    entries,
    totalFuel,
    totalLitres,
    fillups: dieselEntries.length,
    totalAdBlue,
    totalAdBlueLitres,
    adBlueFillups: adBlueEntries.length
  };
};

// ============================================
// Get Fastag Toll Expenses
// ============================================
const getFastagExpenses = async (vehicleId, startDate = null, endDate = null) => {
  const dateFilter = (startDate && endDate) ? " AND t.date BETWEEN ? AND ?" : "";
  const [rows] = await db.query(
    `
    SELECT t.date, t.toll_plaza_name, t.type, t.amount, t.reference_no
    FROM fastag_transactions t
    INNER JOIN fastag_accounts fa ON fa.id = t.fastag_account_id
    WHERE fa.vehicle_id = ?
      AND t.type = 'toll_deduction'
      ${dateFilter}
    ORDER BY t.date DESC, t.id DESC
    `,
    dateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const entries = rows.map(row => ({
    date: row.date,
    plaza: row.toll_plaza_name || 'Toll deduction',
    type: 'Toll Deduction',
    reference: row.reference_no || '—',
    amount: Number(row.amount || 0),
  }));

  const fuelDateFilter = (startDate && endDate) ? " AND f.date BETWEEN ? AND ?" : "";
  const [fuelRows] = await db.query(
    `
    SELECT f.date, f.quantity, f.rate, f.total_cost
    FROM fuel_entries f
    WHERE f.vehicle_id = ?
      AND f.payment_method = 'FASTag Wallet'
      ${fuelDateFilter}
    ORDER BY f.date DESC
    `,
    fuelDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const walletFuelEntries = fuelRows.map(row => ({
    date: row.date,
    litres: Number(row.quantity || 0),
    rate: Number(row.rate || 0),
    amount: Number(row.total_cost || 0),
  }));

  return {
    entries,
    total: entries.reduce((sum, entry) => sum + entry.amount, 0),
    count: entries.length,
    walletFuelEntries,
    walletFuelTotal: walletFuelEntries.reduce((sum, entry) => sum + entry.amount, 0),
  };
};

// ============================================
// Get Maintenance Expenses
// ============================================
const getMaintenance = async (vehicleId, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND service_date BETWEEN ? AND ?" : "";
  const params = dateFilter ? [vehicleId, startDate, endDate] : [vehicleId];

  // Scheduled Services
  const [serviceRows] = await db.query(
    `
    SELECT
      service_date,
      service_type,
      mechanic,
      total_cost
    FROM vehicle_services
    WHERE vehicle_id = ?
    ${dateFilter}
    `,
    params
  );

  // Repair Services
  const [repairRows] = await db.query(
    `
    SELECT
      service_date,
      garage,
      breakdown_type,
      total_cost
    FROM repair_services
    WHERE vehicle_id = ?
    ${dateFilter}
    `,
    params
  );

  const manualDateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";
  const [manualRows] = await db.query(
    `SELECT expense_date, expense_category, vendor_payee, description, amount
     FROM expense_entries
     WHERE vehicle_id = ? AND expense_category = 'Maintenance'
     ${manualDateFilter}`,
    manualDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const records = [];

  serviceRows.forEach(row => {

    records.push({

      date: row.service_date,

      type: row.service_type,

      garage: row.mechanic || "-",

      amount: Number(row.total_cost)

    });

  });

  repairRows.forEach(row => {

    records.push({

      date: row.service_date,

      type: row.breakdown_type,

      garage: row.garage || "-",

      amount: Number(row.total_cost)

    });

  });

  manualRows.forEach(row => records.push({
    date: row.expense_date,
    type: row.expense_category,
    garage: row.vendor_payee || '-',
    amount: Number(row.amount || 0)
  }));

  records.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );

  const totalMaintenance =
    records.reduce(
      (sum, row) =>
        sum + row.amount,
      0
    );

  return {

    records,

    totalMaintenance,

    services: records.length

  };

};
// ============================================
// Get Tyre Expenses
// ============================================
const getTyres = async (vehicleId, vehicleNumber, startDate = null, endDate = null) => {

  const purchaseDateFilter = (startDate && endDate) ? " AND purchase_date BETWEEN ? AND ?" : "";
  const serviceDateFilter = (startDate && endDate) ? " AND service_date BETWEEN ? AND ?" : "";

  // Tyre Purchases
  const [purchaseRows] = await db.query(
    `
    SELECT
      tyres.purchase_date,
      tyres.vendor_name,
      tv.id AS vendor_id,
      tyres.tyre_number,
      tyres.brand,
      tyres.model,
      tyres.tyre_cost
    FROM tyres
    LEFT JOIN tyre_vendors tv ON LOWER(TRIM(tv.vendor_name)) = LOWER(TRIM(tyres.vendor_name))
    WHERE (
      vehicle_id = ?
      OR vehicle_number = ?
      OR EXISTS (
        SELECT 1
        FROM tyre_activity_history tah
        WHERE tah.tyre_number = tyres.tyre_number
          AND TRIM(tah.vehicle_number) = TRIM(?)
          AND tah.activity_type = 'mounted'
      )
    )
    ${purchaseDateFilter}
    `,
    purchaseDateFilter
      ? [vehicleId, vehicleNumber, vehicleNumber, startDate, endDate]
      : [vehicleId, vehicleNumber, vehicleNumber]
  );

  // Tyre Service History
  const [serviceRows] = await db.query(
    `
    SELECT
      service_date,
      t.vendor_name,
      tv.id AS vendor_id,
      tsh.tyre_number,
      issue_type,
      action_taken,
      tyre_repair_cost,
      tyre_replacement_cost,
      retreading_cost
    FROM tyre_service_history tsh
    LEFT JOIN tyres t ON t.tyre_number = tsh.tyre_number
    LEFT JOIN tyre_vendors tv ON LOWER(TRIM(tv.vendor_name)) = LOWER(TRIM(t.vendor_name))
    WHERE (
      tsh.vehicle_id = ?
      OR tsh.vehicle_no = ?
      OR EXISTS (
        SELECT 1
        FROM tyres t
        WHERE t.tyre_number = tsh.tyre_number
          AND (t.vehicle_id = ? OR t.vehicle_number = ?)
      )
    )
    ${serviceDateFilter}
    `,
    serviceDateFilter
      ? [vehicleId, vehicleNumber, vehicleId, vehicleNumber, startDate, endDate]
      : [vehicleId, vehicleNumber, vehicleId, vehicleNumber]
  );

  // Retreading jobs are stored separately from tyre service history.
  // Include completed jobs in the vehicle P&L using the actual vendor cost.
  const retreadDateFilter = (startDate && endDate) ? " AND COALESCE(return_date, sent_date) BETWEEN ? AND ?" : "";
  const [retreadRows] = await db.query(
    `
    SELECT
      tr.id,
      COALESCE(tr.return_date, tr.sent_date) AS retread_date,
      tr.vendor_name,
      tr.vendor_id,
      tr.tyre_no,
      tr.actual_cost,
      tr.status
    FROM tyre_retreading tr
    LEFT JOIN tyres t ON t.tyre_number = tr.tyre_no
    WHERE (
      TRIM(tr.vehicle_no) = TRIM(?)
      OR tr.tyre_id = ?
      OR t.vehicle_id = ?
      OR t.vehicle_number = ?
    )
      AND COALESCE(tr.actual_cost, 0) > 0
    ${retreadDateFilter}
    `,
    retreadDateFilter
      ? [vehicleNumber, vehicleId, vehicleId, vehicleNumber, startDate, endDate]
      : [vehicleNumber, vehicleId, vehicleId, vehicleNumber]
  );

  const expenseDateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";
  const [manualExpenseRows] = await db.query(
    `SELECT expense_date, vendor_payee, description, amount
     FROM expense_entries
     WHERE vehicle_id = ? AND expense_category IN ('Tyre', 'Tyres')
     ${expenseDateFilter}`,
    expenseDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const records = [];

  // Purchases
  purchaseRows.forEach(row => {

    records.push({

      date: row.purchase_date,

      type: "Purchase",

      description: `${row.brand} ${row.model}`,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      tyreNumber: row.tyre_number,

      amount: Number(row.tyre_cost)

    });

  });

  // Repairs
  serviceRows.forEach(row => {

    if (Number(row.tyre_repair_cost) > 0) {

      records.push({

        date: row.service_date,

        type: "Repair",

        description: row.issue_type,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        tyreNumber: row.tyre_number,

        amount: Number(row.tyre_repair_cost)

      });

    }

    if (Number(row.tyre_replacement_cost) > 0) {

      records.push({

        date: row.service_date,

        type: "Replacement",

        description: row.action_taken,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        tyreNumber: row.tyre_number,

        amount: Number(row.tyre_replacement_cost)

      });

    }

    if (Number(row.retreading_cost) > 0) {

      records.push({

        date: row.service_date,

        type: "Retreading",

        description: row.action_taken,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        tyreNumber: row.tyre_number,

        amount: Number(row.retreading_cost)

      });

    }

  });

  records.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );

  retreadRows.forEach(row => {
    records.push({
      date: row.retread_date,
      type: "Retreading",
      description: "Retreading Cost",
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      tyreNumber: row.tyre_no,
      amount: Number(row.actual_cost)
    });
  });

  manualExpenseRows.forEach(row => records.push({
    date: row.expense_date,
    type: 'Expense',
    description: row.description || 'Manual tyre expense',
    vendorId: null,
    vendorName: row.vendor_payee || null,
    tyreNumber: null,
    amount: Number(row.amount || 0)
  }));

  const totalTyres =
    records.reduce(
      (sum, row) =>
        sum + row.amount,
      0
    );

  return {

    records,

    totalTyres,

    transactions: records.length

  };

};

// ============================================
// Get Battery Expenses
// ============================================
const getBattery = async (vehicleId, startDate = null, endDate = null) => {
  const dateFilter = (startDate && endDate) ? " AND purchase_date BETWEEN ? AND ?" : "";
  const manualDateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";

  const [rows] = await db.query(
    `SELECT purchase_date, brand, model, purchase_cost, status
     FROM batteries
     WHERE vehicle_id = ? ${dateFilter}
     ORDER BY purchase_date DESC`,
    dateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );
  const [manualRows] = await db.query(
    `SELECT expense_date, expense_category, description, amount
     FROM expense_entries
     WHERE vehicle_id = ? AND expense_category IN ('Battery', 'Batteries')
     ${manualDateFilter}`,
    manualDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const records = rows.map(row => ({
    date: row.purchase_date,
    type: row.status,
    description: `${row.brand} ${row.model}`,
    amount: Number(row.purchase_cost)
  }));
  manualRows.forEach(row => records.push({
    date: row.expense_date,
    type: row.expense_category,
    description: row.description || 'Manual battery expense',
    amount: Number(row.amount || 0)
  }));

  const totalBattery =
    records.reduce(
      (sum, item) => sum + item.amount,
      0
    );

  return {

    records,

    totalBattery,

    transactions: records.length

  };

};
// ============================================
// Get EMI Cost (from actual vehicle_emi_payments records ×
// the vehicle's fixed monthly installment — not a manually
// entered expense, so it stays in sync automatically)
// ============================================
const getEmiCost = async (vehicleId, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND ep.paid_date BETWEEN ? AND ?" : "";
  const params = dateFilter ? [startDate, endDate, vehicleId] : [vehicleId];

  const [rows] = await db.query(
    `
    SELECT
      v.emi_amount,
      v.financier_name,
      v.loan_tenure,
      COUNT(ep.id) AS paymentsCount
    FROM vehicles v
    LEFT JOIN vehicle_emi_payments ep
      ON ep.vehicle_id = v.id
      ${dateFilter}
    WHERE v.id = ?
    GROUP BY v.id, v.emi_amount, v.financier_name, v.loan_tenure
    `,
    params
  );

  const row = rows[0];
  const emiAmount = Number(row?.emi_amount || 0);
  const paymentsCount = Number(row?.paymentsCount || 0);

  const manualDateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";
  const [manualRows] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expense_entries
     WHERE vehicle_id = ? AND expense_category = 'EMI'
     ${manualDateFilter}`,
    manualDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );
  const manualEmiTotal = Number(manualRows[0]?.total || 0);

  return {
    emiAmount,
    financierName: row?.financier_name || null,
    loanTenure: row?.loan_tenure || null,
    paymentsCount,
    manualEmiTotal,
    totalEMI: (emiAmount * paymentsCount) + manualEmiTotal
  };
};

// ============================================
// Get Driver Settlement
// ============================================
const getDriverSettlement = async (vehicleId, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND (ds.created_at BETWEEN ? AND ? OR ds.statement_month BETWEEN DATE_FORMAT(?, '%Y-%m') AND DATE_FORMAT(?, '%Y-%m'))" : "";
  const dateParams = (startDate && endDate) ? [startDate, endDate, startDate, endDate] : [];

  const [rows] = await db.query(
    `
    SELECT
      ds.id,
      ds.settlement_no,
      ds.statement_month,
      ds.vehicle_id,
      ds.vehicle_no,
      ds.driver_id,
      ds.driver_name,
      ds.plant_name,
      ds.fixed_salary,
      ds.total_battha,
      ds.loading_charges,
      ds.unloading_charges,
      ds.bonus,
      ds.other_allowances,
      ds.total_earnings,
      ds.driver_advance,
      ds.penalty,
      ds.other_deductions,
      ds.total_deductions,
      ds.net_payable,
      ds.status,
      ds.created_at
    FROM driver_settlements ds
    WHERE (
      ds.vehicle_id = ?
      OR ds.vehicle_no = (SELECT vehicle_no FROM vehicles WHERE id = ?)
      OR ds.vehicle_no = ?
      OR (
        (ds.vehicle_id IS NULL OR ds.vehicle_id = 0)
        AND ds.driver_id = (SELECT assigned_driver FROM vehicles WHERE id = ?)
      )
    )
    ${dateFilter}
    ORDER BY ds.created_at DESC
    `,
    [vehicleId, vehicleId, String(vehicleId), vehicleId, ...dateParams]
  );

  const [manualRows] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
     FROM expense_entries
     WHERE vehicle_id = ? AND expense_category IN ('Driver Salary', 'Salary')
     ${(startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : ""}`,
    (startDate && endDate) ? [vehicleId, startDate, endDate] : [vehicleId]
  );
  const manualSalaryTotal = Number(manualRows[0]?.total || 0);
  const manualSalaryCount = Number(manualRows[0]?.count || 0);

  // Get vehicle's assigned driver and plant info
  const [vehicleInfoRows] = await db.query(
    `SELECT v.id, v.vehicle_no, v.assigned_driver, d.id as driver_id, d.full_name as driver_name, s.station_name as plant_name
     FROM vehicles v
     LEFT JOIN drivers d ON v.assigned_driver = d.id
     LEFT JOIN stations s ON v.station_id = s.id
     WHERE v.id = ?`,
    [vehicleId]
  );
  const vehicleInfo = vehicleInfoRows[0] || {};

  // Check un-settled trips for this vehicle
  const [unsettledTripRows] = await db.query(
    `SELECT COUNT(*) as trip_count, COALESCE(SUM(driver_advance), 0) as advance_total
     FROM trips
     WHERE vehicle_id = ? ${(startDate && endDate) ? " AND trip_date BETWEEN ? AND ?" : ""}`,
    (startDate && endDate) ? [vehicleId, startDate, endDate] : [vehicleId]
  );
  const pendingTripCount = Number(unsettledTripRows[0]?.trip_count || 0);
  const pendingAdvanceTotal = Number(unsettledTripRows[0]?.advance_total || 0);

  if (!rows.length) {
    return {
      settlement: null,
      settlements: [],
      settlementCount: 0,
      driverInfo: {
        id: vehicleInfo.driver_id || null,
        name: vehicleInfo.driver_name || null,
        plant: vehicleInfo.plant_name || null,
        vehicleNo: vehicleInfo.vehicle_no || null
      },
      pendingDetails: {
        tripCount: pendingTripCount,
        advanceTotal: pendingAdvanceTotal
      },
      grossEarnings: 0,
      totalDeductions: 0,
      netDriverCost: manualSalaryTotal,
      manualSalaryTotal,
      manualSalaryCount
    };
  }

  // Calculate totals across settlements for this vehicle/period
  const totalFixedSalary = rows.reduce((s, r) => s + Number(r.fixed_salary || 0), 0);
  const totalBattha = rows.reduce((s, r) => s + Number(r.total_battha || 0), 0);
  const totalLoading = rows.reduce((s, r) => s + Number(r.loading_charges || 0), 0);
  const totalUnloading = rows.reduce((s, r) => s + Number(r.unloading_charges || 0), 0);
  const totalBonus = rows.reduce((s, r) => s + Number(r.bonus || 0), 0);
  const totalOtherAllowances = rows.reduce((s, r) => s + Number(r.other_allowances || 0), 0);
  const totalGrossEarnings = rows.reduce((s, r) => s + Number(r.total_earnings || (Number(r.fixed_salary || 0) + Number(r.total_battha || 0) + Number(r.loading_charges || 0) + Number(r.unloading_charges || 0) + Number(r.bonus || 0) + Number(r.other_allowances || 0))), 0);

  const totalAdvance = rows.reduce((s, r) => s + Number(r.driver_advance || 0), 0);
  const totalPenalty = rows.reduce((s, r) => s + Number(r.penalty || 0), 0);
  const totalOtherDeductions = rows.reduce((s, r) => s + Number(r.other_deductions || 0), 0);
  const totalDeductions = rows.reduce((s, r) => s + Number(r.total_deductions || (Number(r.driver_advance || 0) + Number(r.penalty || 0) + Number(r.other_deductions || 0))), 0);
  const totalNetPayable = rows.reduce((s, r) => s + Number(r.net_payable || 0), 0);

  const latest = rows[0];

  // Aggregated summary object with breakdown
  const aggregatedSettlement = {
    id: latest.id,
    settlement_no: latest.settlement_no,
    statement_month: rows.length === 1 ? latest.statement_month : `${rows.length} Months (${latest.statement_month})`,
    status: latest.status,
    driver_name: latest.driver_name,
    plant_name: latest.plant_name,
    fixed_salary: totalFixedSalary,
    total_battha: totalBattha,
    loading_charges: totalLoading,
    unloading_charges: totalUnloading,
    bonus: totalBonus,
    other_allowances: totalOtherAllowances,
    total_earnings: totalGrossEarnings,
    driver_advance: totalAdvance,
    penalty: totalPenalty,
    other_deductions: totalOtherDeductions,
    total_deductions: totalDeductions,
    net_payable: totalNetPayable
  };

  return {
    settlement: aggregatedSettlement,
    settlements: rows,
    settlementCount: rows.length,
    driverInfo: {
      id: vehicleInfo.driver_id || latest.driver_id || null,
      name: vehicleInfo.driver_name || latest.driver_name || null,
      plant: vehicleInfo.plant_name || latest.plant_name || null,
      vehicleNo: vehicleInfo.vehicle_no || latest.vehicle_no || null
    },
    pendingDetails: {
      tripCount: pendingTripCount,
      advanceTotal: pendingAdvanceTotal
    },
    grossEarnings: totalGrossEarnings,
    totalDeductions: totalDeductions,
    netDriverCost: totalNetPayable + manualSalaryTotal,
    manualSalaryTotal,
    manualSalaryCount
  };
};

// ============================================
// Get RTA Expenses
// ============================================
const getRTAExpenses = async (vehicleNo, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND e.expense_date BETWEEN ? AND ?" : "";

  const [rows] = await db.query(
    `
    SELECT
      e.id,
      e.vendor_id,
      v.vendor_name,
      e.expense_date,
      e.expense_type,
      e.amount,
      e.reference_no,
      e.notes,
      e.document
    FROM rta_expenses e
    LEFT JOIN rta_vendors v ON e.vendor_id = v.id
    WHERE e.vehicle_no = ?
    ${dateFilter}
    ORDER BY e.expense_date DESC
    `,
    dateFilter ? [vehicleNo, startDate, endDate] : [vehicleNo]
  );

  const records = rows.map(row => ({

    id: row.id,

    vendorId: row.vendor_id,

    vendorName: row.vendor_name || 'RTA Agent',

    date: row.expense_date,

    type: row.expense_type,

    reference: row.reference_no,

    notes: row.notes,

    document: row.document,

    amount: Number(row.amount)

  }));

  const totalRTA =
    records.reduce(
      (sum, item) => sum + item.amount,
      0
    );

  return {

    records,

    totalRTA,

    transactions: records.length

  };

};

// ============================================
// Get Miscellaneous Expenses
// ============================================
const getMiscExpenses = async (vehicleId, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";

  const [rows] = await db.query(
    `
    SELECT
      expense_date,
      expense_category,
      expense_title,
      description,
      amount
    FROM expense_entries
    WHERE vehicle_id = ?
    AND expense_category NOT IN
    (
      'Fuel',
      'Maintenance',
      'Tyre',
      'Tyres',
      'Battery',
      'Batteries',
      'Driver Settlement',
      'Salary',
      'Driver Salary',
      'EMI',
      'RTA'
    )
    ${dateFilter}
    ORDER BY expense_date DESC
    `,
    dateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const records = rows.map(row => ({

    date: row.expense_date,

    type: row.expense_category,

    description:
      row.expense_title ||
      row.description ||
      "-",

    amount: Number(row.amount)

  }));

  const totalMisc =
    records.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const totalEMI = records
    .filter(r => r.type === 'EMI')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalOther = totalMisc - totalEMI;

  return {

    records,

    totalMisc,

    totalEMI,

    totalOther,

    transactions: records.length

  };

};
// ============================================
// Fleet Profit & Loss List
// ============================================

// Builds a Map of vehicle_id (or vehicle_no) -> aggregate row, from a result set
// that already ran GROUP BY on that key. Avoids the per-vehicle query loop below.
function toMap(rows, key) {
  return new Map(rows.map(r => [r[key], r]));
}

const getTruckPLList = async (startDate = null, endDate = null, options = {}) => {

    const { page = null, pageSize = null, search = null } = options;

    const searchFilter = search
        ? " AND (v.vehicle_no LIKE ? OR d.full_name LIKE ? OR s.station_name LIKE ? OR v.make_brand LIKE ?) "
        : "";
    const searchParams = search ? Array(4).fill(`%${search}%`) : [];

    const baseFrom = `
        FROM vehicles v
        LEFT JOIN drivers d ON d.id = v.assigned_driver
        LEFT JOIN stations s ON s.id = v.station_id
        WHERE 1 = 1 ${searchFilter}
    `;

    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total ${baseFrom}`,
        searchParams
    );

    const usePagination = Boolean(page && pageSize);
    const limitClause = usePagination ? " LIMIT ? OFFSET ? " : "";
    const limitParams = usePagination
        ? [Number(pageSize), (Number(page) - 1) * Number(pageSize)]
        : [];

    const [rows] = await db.query(
        `
        SELECT
            v.id,
            v.vehicle_no,
            v.make_brand,
            v.vehicle_status,
            v.emi_amount,
            IFNULL(d.full_name,'-') AS driver,
            IFNULL(s.station_name,'-') AS plant
        ${baseFrom}
        ORDER BY v.vehicle_no
        ${limitClause}
        `,
        [...searchParams, ...limitParams]
    );

    if (rows.length === 0) {
        return { list: [], total };
    }

    // ── Batched aggregates for exactly the vehicles on this page — a constant
    // number of queries instead of ~10 queries PER vehicle (was a severe N+1:
    // 300 trucks meant ~3,000+ sequential round-trips on every fleet load). ──
    const vehicleIds = rows.map(r => r.id);
    const vehicleNos = rows.map(r => r.vehicle_no);

    const tripDateFilter = (startDate && endDate) ? " AND trip_date BETWEEN ? AND ?" : "";
    const incomeDateFilter = (startDate && endDate) ? " AND created_at BETWEEN ? AND ?" : "";
    const fuelDateFilter = (startDate && endDate) ? " AND date BETWEEN ? AND ?" : "";
    const serviceDateFilter = (startDate && endDate) ? " AND service_date BETWEEN ? AND ?" : "";
    const tyrePurchaseDateFilter = (startDate && endDate) ? " AND purchase_date BETWEEN ? AND ?" : "";
    const batteryDateFilter = (startDate && endDate) ? " AND purchase_date BETWEEN ? AND ?" : "";
    const rtaDateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";
    const miscDateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";
    const emiDateFilter = (startDate && endDate) ? " AND paid_date BETWEEN ? AND ?" : "";
    const dateParams = (startDate && endDate) ? [startDate, endDate] : [];

    const [
        [tripRows], [incomeRows], [fuelRows], [serviceRows], [repairRows],
        [tyrePurchaseRows], [tyreServiceRows], [batteryRows], [driverRows],
        [rtaRows], [miscRows], [emiRows],
    ] = await Promise.all([
        db.query(
            `SELECT vehicle_id,
                    COUNT(*) AS trip_count,
                    COALESCE(SUM(CASE WHEN NOT EXISTS (
                        SELECT 1 FROM income_entries ie
                        WHERE ie.trip_id = trips.id OR ie.trip_id = trips.trip_id
                    ) THEN freight_amount ELSE 0 END), 0) AS trip_revenue

           FROM trips
           WHERE vehicle_id IN (?)
             ${tripDateFilter}
           GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COALESCE(SUM(amount),0) AS income_total
           FROM income_entries WHERE vehicle_id IN (?) ${incomeDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id,
                COALESCE(SUM(CASE WHEN fuel_type = 'AdBlue' THEN total_cost ELSE 0 END),0) AS ad_blue,
                COALESCE(SUM(CASE WHEN fuel_type <> 'AdBlue' OR fuel_type IS NULL THEN total_cost ELSE 0 END),0) AS fuel
             FROM fuel_entries WHERE vehicle_id IN (?) ${fuelDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COALESCE(SUM(total_cost),0) AS total
             FROM vehicle_services WHERE vehicle_id IN (?) ${serviceDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COALESCE(SUM(total_cost),0) AS total
             FROM repair_services WHERE vehicle_id IN (?) ${serviceDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COALESCE(SUM(tyre_cost),0) AS total
             FROM tyres WHERE vehicle_id IN (?) ${tyrePurchaseDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COALESCE(SUM(tyre_repair_cost + tyre_replacement_cost + retreading_cost),0) AS total
             FROM tyre_service_history WHERE vehicle_id IN (?) ${serviceDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COALESCE(SUM(purchase_cost),0) AS total
             FROM batteries WHERE vehicle_id IN (?) ${batteryDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT 
               v.id AS vehicle_id, 
               COALESCE(SUM(ds.net_payable), 0) AS net_payable
             FROM vehicles v
             LEFT JOIN driver_settlements ds ON (
               ds.vehicle_id = v.id 
               OR (ds.vehicle_no IS NOT NULL AND ds.vehicle_no <> '' AND ds.vehicle_no = v.vehicle_no)
               OR ((ds.vehicle_id IS NULL OR ds.vehicle_id = 0) AND ds.driver_id = v.assigned_driver)
             )
             WHERE v.id IN (?)
             GROUP BY v.id`,
            [vehicleIds]
        ),
        db.query(
            `SELECT vehicle_no, COALESCE(SUM(amount),0) AS total
             FROM rta_expenses WHERE vehicle_no IN (?) ${rtaDateFilter} GROUP BY vehicle_no`,
            [vehicleNos, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id,
                COALESCE(SUM(amount),0) AS misc_total,
                COALESCE(SUM(CASE WHEN expense_category = 'EMI' THEN amount ELSE 0 END),0) AS emi_total
             FROM expense_entries
             WHERE vehicle_id IN (?)
               AND expense_category NOT IN ('Fuel','Maintenance','Tyre','Tyres','Battery','Batteries','Driver Salary','Driver Settlement','Salary','EMI','RTA')
               ${miscDateFilter}
             GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COUNT(*) AS payments_count
             FROM vehicle_emi_payments WHERE vehicle_id IN (?) ${emiDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
    ]);

    const tripMap = toMap(tripRows, 'vehicle_id');
    const incomeMap = toMap(incomeRows, 'vehicle_id');
    const fuelMap = toMap(fuelRows, 'vehicle_id');
    const serviceMap = toMap(serviceRows, 'vehicle_id');
    const repairMap = toMap(repairRows, 'vehicle_id');
    const tyrePurchaseMap = toMap(tyrePurchaseRows, 'vehicle_id');
    const tyreServiceMap = toMap(tyreServiceRows, 'vehicle_id');
    const batteryMap = toMap(batteryRows, 'vehicle_id');
    const driverMap = toMap(driverRows, 'vehicle_id');
    const rtaMap = toMap(rtaRows, 'vehicle_no');
    const miscMap = toMap(miscRows, 'vehicle_id');
    const emiMap = toMap(emiRows, 'vehicle_id');

    const list = rows.map(row => {

        const tripRevenue = Number(tripMap.get(row.id)?.trip_revenue || 0);
        const tripCount = Number(tripMap.get(row.id)?.trip_count || 0);
        const otherIncome = Number(incomeMap.get(row.id)?.income_total || 0);

        const totalFuel = Number(fuelMap.get(row.id)?.fuel || 0);
        const totalAdBlue = Number(fuelMap.get(row.id)?.ad_blue || 0);

        const serviceRepairCost =
            Number(serviceMap.get(row.id)?.total || 0) +
            Number(repairMap.get(row.id)?.total || 0);

        const tyreCost =
            Number(tyrePurchaseMap.get(row.id)?.total || 0) +
            Number(tyreServiceMap.get(row.id)?.total || 0);

        const batteryCost = Number(batteryMap.get(row.id)?.total || 0);
        const driverCost = Number(driverMap.get(row.id)?.net_payable || 0);
        const rtaCost = Number(rtaMap.get(row.vehicle_no)?.total || 0);

        // miscTotal (from expense_entries) already includes any manually-logged
        // 'EMI' category rows — manualEmiTotal is split out of it for display only,
        // not added again. computedEmiCost (from actual EMI-paid records × the
        // vehicle's installment) is a genuinely separate source and gets added on top.
        const miscTotal = Number(miscMap.get(row.id)?.misc_total || 0);
        const manualEmiTotal = Number(miscMap.get(row.id)?.emi_total || 0);

        const emiPaymentsCount = Number(emiMap.get(row.id)?.payments_count || 0);
        const computedEmiCost = emiPaymentsCount * Number(row.emi_amount || 0);
        const emiTotal = manualEmiTotal + computedEmiCost;

        const totalRevenue = tripRevenue + otherIncome;

        const totalExpenses =
            totalFuel + totalAdBlue + serviceRepairCost + tyreCost +
            batteryCost + driverCost + rtaCost + miscTotal + computedEmiCost;

        const profit = totalRevenue - totalExpenses;

        const margin = totalRevenue > 0
            ? Number(((profit / totalRevenue) * 100).toFixed(2))
            : 0;

        return {
            vehicleId: row.id,
            truckNo: row.vehicle_no,
            plant: row.plant,
            driver: row.driver,
            vehicleModel: row.make_brand,
            vehicleStatus: row.vehicle_status,
            completedTrips: tripCount,
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit,
            margin,
            status: profit >= 0 ? "Good" : "Loss",
            lastUpdated: new Date(),
            expenseBreakdown: {
                fuel: totalFuel,
                adBlue: totalAdBlue,
                emi: emiTotal,
                maintenance: serviceRepairCost + tyreCost + batteryCost,
                driver: driverCost,
                ops: rtaCost,
                other: miscTotal - manualEmiTotal,
            },
        };
    });

    return { list, total };

};

// ============================================
// Fleet Summary (for Reports dashboard KPIs)
// ============================================
const getFleetSummary = async (startDate = null, endDate = null) => {

    const { list } = await getTruckPLList(startDate, endDate);

    const totalRevenue = list.reduce((sum, t) => sum + t.revenue, 0);
    const totalExpenses = list.reduce((sum, t) => sum + t.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0
        ? Number(((netProfit / totalRevenue) * 100).toFixed(2))
        : 0;

    const totalTrucks = list.length;
    const activeTrucks = list.filter(t => t.vehicleStatus === 'Active').length;

    const expenseBreakdown = list.reduce((acc, t) => {
        acc.fuel += t.expenseBreakdown.fuel;
        acc.adBlue += t.expenseBreakdown.adBlue;
        acc.emi += t.expenseBreakdown.emi;
        acc.maintenance += t.expenseBreakdown.maintenance;
        acc.driver += t.expenseBreakdown.driver;
        acc.ops += t.expenseBreakdown.ops;
        acc.other += t.expenseBreakdown.other;
        return acc;
    }, { fuel: 0, adBlue: 0, emi: 0, maintenance: 0, driver: 0, ops: 0, other: 0 });

    const ranked = [...list].sort((a, b) => b.profit - a.profit);
    const topProfit = ranked.slice(0, 5).filter(t => t.profit > 0);
    const topLoss = ranked.slice(-5).reverse().filter(t => t.profit < 0);

    return {
        kpis: {
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin,
            activeTrucks,
            totalTrucks
        },
        expenseBreakdown,
        topProfit,
        topLoss
    };
};

module.exports = {
  getTruckInfo,
  getRevenue,
  getFuel,
  getFastagExpenses,
  getMaintenance,
  getTyres,
  getBattery,
  getEmiCost,
  getDriverSettlement,
  getRTAExpenses,
  getMiscExpenses,
  getTruckPLList,
  getFleetSummary,
};