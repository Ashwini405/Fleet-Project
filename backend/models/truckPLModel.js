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
const getRevenue = async (vehicleId) => {

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
    ORDER BY trip_date DESC
    `,
    [vehicleId]
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
    ORDER BY created_at DESC
    `,
    [vehicleId]
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
const getFuel = async (vehicleId) => {

  const [rows] = await db.query(
    `
    SELECT
      date,
      station_name,
      quantity,
      rate,
      total_cost
    FROM fuel_entries
    WHERE vehicle_id = ?
    ORDER BY date DESC
    `,
    [vehicleId]
  );

  const entries = rows.map(row => ({
    date: row.date,
    station: row.station_name,
    litres: Number(row.quantity),
    rate: Number(row.rate),
    amount: Number(row.total_cost)
  }));

  const totalFuel = entries.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalLitres = entries.reduce(
    (sum, item) => sum + item.litres,
    0
  );

  return {
    entries,
    totalFuel,
    totalLitres,
    fillups: entries.length
  };
};

// ============================================
// Get Maintenance Expenses
// ============================================
const getMaintenance = async (vehicleId) => {

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
    `,
    [vehicleId]
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
    `,
    [vehicleId]
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
const getTyres = async (vehicleId) => {

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
    `,
    [vehicleId]
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
    `,
    [vehicleId]
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
const getBattery = async (vehicleId) => {

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
    ORDER BY purchase_date DESC
    `,
    [vehicleId]
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
const getRTAExpenses = async (vehicleNo) => {

  const [rows] = await db.query(
    `
    SELECT
      expense_date,
      expense_type,
      amount,
      reference_no
    FROM rta_expenses
    WHERE vehicle_no = ?
    ORDER BY expense_date DESC
    `,
    [vehicleNo]
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
const getMiscExpenses = async (vehicleId) => {

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
    ORDER BY expense_date DESC
    `,
    [vehicleId]
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

  return {

    records,

    totalMisc,

    transactions: records.length

  };

};
// ============================================
// Fleet Profit & Loss List
// ============================================

const getTruckPLList = async () => {

    const [rows] = await db.query(`
        SELECT

            v.id,
            v.vehicle_no,
            v.make_brand,
            v.vehicle_status,

            IFNULL(d.full_name,'-') AS driver,

            IFNULL(s.station_name,'-') AS plant

        FROM vehicles v

        LEFT JOIN drivers d
            ON d.id = v.assigned_driver

        LEFT JOIN stations s
            ON s.id = v.station_id

        ORDER BY v.vehicle_no
    `);

    const result = [];

    for (const row of rows) {

        const revenue =
            await getRevenue(row.id);

        const fuel =
            await getFuel(row.id);

        const maintenance =
            await getMaintenance(row.id);

        const tyres =
            await getTyres(row.id);

        const battery =
            await getBattery(row.id);

        const driver =
            await getDriverSettlement(row.id);

        const rta =
            await getRTAExpenses(row.vehicle_no);

        const misc =
            await getMiscExpenses(row.id);

        const totalRevenue =
            revenue.totals.totalRevenue;

        const totalExpenses =

            fuel.totalFuel +

            maintenance.totalMaintenance +

            tyres.totalTyres +

            battery.totalBattery +

            driver.netDriverCost +

            rta.totalRTA +

            misc.totalMisc;

        const profit =
            totalRevenue - totalExpenses;

        const margin =
            totalRevenue > 0
                ? Number(
                    (
                        (profit / totalRevenue) *
                        100
                    ).toFixed(2)
                )
                : 0;

        result.push({

    vehicleId: row.id,

    truckNo: row.vehicle_no,

    plant: row.plant,

    driver: row.driver,

    vehicleModel: row.make_brand,

    completedTrips: revenue.trips.length,

    revenue: totalRevenue,

    expenses: totalExpenses,

    profit,

    margin,

    status: profit >= 0 ? "Good" : "Loss",

    lastUpdated: new Date()

});

    }

    return result;

};
module.exports = {
  getTruckInfo,
  getRevenue,
  getFuel,
  getMaintenance,
  getTyres,
  getBattery,
  getDriverSettlement,
  getRTAExpenses,
  getMiscExpenses,
  getTruckPLList,
};