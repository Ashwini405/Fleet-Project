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
      trip_date,
      source,
      destination,
      customer_name,
      freight_amount
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
      rental_description
    FROM income_entries
    WHERE vehicle_id = ?
      AND income_category <> 'Freight'
      ${incomeDateFilter}
    ORDER BY created_at DESC
    `,
    incomeDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const trips = tripRows.map(row => ({
    date: row.trip_date,
    route: `${row.source} → ${row.destination}`,
    type: "Freight",
    amount: Number(row.freight_amount)
  }));

  const rental = incomeRows
    .filter(x => x.income_category === "Rental")
    .map(x => ({
      date: x.freight_start_date,
      client: x.customer_name,
      days: "-",
      amount: Number(x.amount)
    }));

  const other = incomeRows
    .filter(x => x.income_category !== "Rental")
    .map(x => ({
      date: x.freight_start_date,
      description:
        x.rental_description ||
        x.income_category,
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
        totalOtherRevenue

    }

  };

};

// ============================================
// Get Fuel Expenses
// ============================================
const getFuel = async (vehicleId, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND date BETWEEN ? AND ?" : "";

  const [rows] = await db.query(
    `
    SELECT
      date,
      station_name,
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

  const entries = rows.map(row => ({
    date: row.date,
    station: row.station_name,
    litres: Number(row.quantity),
    rate: Number(row.rate),
    amount: Number(row.total_cost),
    fuelType: row.fuel_type
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
const getTyres = async (vehicleId, startDate = null, endDate = null) => {

  const purchaseDateFilter = (startDate && endDate) ? " AND purchase_date BETWEEN ? AND ?" : "";
  const serviceDateFilter = (startDate && endDate) ? " AND service_date BETWEEN ? AND ?" : "";

  // Tyre Purchases
  const [purchaseRows] = await db.query(
    `
    SELECT
      purchase_date,
      brand,
      model,
      tyre_cost
    FROM tyres
    WHERE vehicle_id = ?
    ${purchaseDateFilter}
    `,
    purchaseDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  // Tyre Service History
  const [serviceRows] = await db.query(
    `
    SELECT
      service_date,
      issue_type,
      action_taken,
      tyre_repair_cost,
      tyre_replacement_cost,
      retreading_cost
    FROM tyre_service_history
    WHERE vehicle_id = ?
    ${serviceDateFilter}
    `,
    serviceDateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const records = [];

  // Purchases
  purchaseRows.forEach(row => {

    records.push({

      date: row.purchase_date,

      type: "Purchase",

      description: `${row.brand} ${row.model}`,

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

        amount: Number(row.tyre_repair_cost)

      });

    }

    if (Number(row.tyre_replacement_cost) > 0) {

      records.push({

        date: row.service_date,

        type: "Replacement",

        description: row.action_taken,

        amount: Number(row.tyre_replacement_cost)

      });

    }

    if (Number(row.retreading_cost) > 0) {

      records.push({

        date: row.service_date,

        type: "Retreading",

        description: row.action_taken,

        amount: Number(row.retreading_cost)

      });

    }

  });

  records.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );

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

  const [rows] = await db.query(
    `
    SELECT
      purchase_date,
      brand,
      model,
      purchase_cost,
      status
    FROM batteries
    WHERE vehicle_id = ?
    ${dateFilter}
    ORDER BY purchase_date DESC
    `,
    dateFilter ? [vehicleId, startDate, endDate] : [vehicleId]
  );

  const records = rows.map(row => ({

    date: row.purchase_date,

    type: row.status,

    description: `${row.brand} ${row.model}`,

    amount: Number(row.purchase_cost)

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

  return {
    emiAmount,
    financierName: row?.financier_name || null,
    loanTenure: row?.loan_tenure || null,
    paymentsCount,
    totalEMI: emiAmount * paymentsCount
  };
};

// ============================================
// Get Driver Settlement
// ============================================
const getDriverSettlement = async (vehicleId) => {

  const [rows] = await db.query(
`
SELECT
  settlement_no,
  statement_month,
  fixed_salary,
  total_battha,
  loading_charges,
  unloading_charges,
  bonus,
  other_allowances,
  total_earnings,
  driver_advance,
  penalty,
  other_deductions,
  total_deductions,
  net_payable,
  status
FROM driver_settlements
WHERE vehicle_id = ?
ORDER BY created_at DESC
LIMIT 1
`,
[vehicleId]
);

  if (!rows.length) {

    return {

      settlement: null,

      grossEarnings: 0,

      totalDeductions: 0,

      netDriverCost: 0

    };

  }

  const s = rows[0];

  return {

    settlement: s,

    grossEarnings: Number(s.total_earnings),

    totalDeductions: Number(s.total_deductions),

    netDriverCost: Number(s.net_payable)

  };

};

// ============================================
// Get RTA Expenses
// ============================================
const getRTAExpenses = async (vehicleNo, startDate = null, endDate = null) => {

  const dateFilter = (startDate && endDate) ? " AND expense_date BETWEEN ? AND ?" : "";

  const [rows] = await db.query(
    `
    SELECT
      expense_date,
      expense_type,
      amount,
      reference_no
    FROM rta_expenses
    WHERE vehicle_no = ?
    ${dateFilter}
    ORDER BY expense_date DESC
    `,
    dateFilter ? [vehicleNo, startDate, endDate] : [vehicleNo]
  );

  const records = rows.map(row => ({

    date: row.expense_date,

    type: row.expense_type,

    reference: row.reference_no,

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
      'Battery',
      'Driver Settlement',
      'Salary',
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
            `SELECT vehicle_id, COUNT(*) AS trip_count, COALESCE(SUM(freight_amount),0) AS trip_revenue
             FROM trips WHERE vehicle_id IN (?) ${tripDateFilter} GROUP BY vehicle_id`,
            [vehicleIds, ...dateParams]
        ),
        db.query(
            `SELECT vehicle_id, COALESCE(SUM(amount),0) AS income_total
             FROM income_entries WHERE vehicle_id IN (?) AND income_category <> 'Freight' ${incomeDateFilter} GROUP BY vehicle_id`,
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
            `SELECT ds.vehicle_id, ds.net_payable
             FROM driver_settlements ds
             INNER JOIN (
                 SELECT vehicle_id, MAX(created_at) AS max_created
                 FROM driver_settlements
                 WHERE vehicle_id IN (?)
                 GROUP BY vehicle_id
             ) latest ON ds.vehicle_id = latest.vehicle_id AND ds.created_at = latest.max_created`,
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
               AND expense_category NOT IN ('Fuel','Maintenance','Tyre','Battery','Driver Settlement','Salary','RTA')
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