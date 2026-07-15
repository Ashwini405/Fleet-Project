const db = require('../config/db');
const lifecycle = require('../services/maintenanceLifecycleService');

const getMaintenanceAlerts = async (req, res) => {
  try {
    const alerts = await lifecycle.getDashboardAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('GET DASHBOARD ALERTS ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ==========================================================
// GET /api/dashboard/kpis
// Returns all live KPI data for the Dashboard page.
// ==========================================================
const getKpis = async (req, res) => {
  try {
    // ── Fleet KPIs ──────────────────────────────────────────
    const [[fleetTotal]]   = await db.query(`SELECT COUNT(*) AS n FROM vehicles`);
    const [[fleetActive]]  = await db.query(`SELECT COUNT(*) AS n FROM vehicles WHERE vehicle_status = 'active'`);
    const [[fleetRepair]]  = await db.query(`SELECT COUNT(*) AS n FROM vehicles WHERE vehicle_status = 'under_repair'`);

    // ── Trip KPIs ───────────────────────────────────────────
    const [[tripsRunning]]   = await db.query(`SELECT COUNT(*) AS n FROM trips WHERE trip_status IN ('Started','In Transit') AND is_deleted = 0`);
    const [[tripsCompleted]] = await db.query(`SELECT COUNT(*) AS n FROM trips WHERE trip_status = 'Completed' AND is_deleted = 0`);
    const [[tripsCancelled]] = await db.query(`SELECT COUNT(*) AS n FROM trips WHERE trip_status = 'Cancelled' AND is_deleted = 0`);

    // ── Finance KPIs ────────────────────────────────────────
    const [[tripRevenue]]   = await db.query(`SELECT IFNULL(SUM(freight_amount),0) AS n FROM trips WHERE is_deleted = 0`);
    const [[incomeRevenue]] = await db.query(`SELECT IFNULL(SUM(amount),0) AS n FROM income_entries`);
    const [[fuelExpense]]   = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM fuel_entries`);
    const [[maintExpense]]  = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM vehicle_services`);
    const [[repairExpense]] = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM repair_services`);
    const [[tyreExpense]]   = await db.query(`SELECT IFNULL(SUM(tyre_cost),0) AS n FROM tyres`);
    const [[batteryExpense]]= await db.query(`SELECT IFNULL(SUM(purchase_cost),0) AS n FROM batteries`);
    const [[miscExpense]]   = await db.query(`SELECT IFNULL(SUM(amount),0) AS n FROM expense_entries`);
    const [[rtaExpense]]    = await db.query(`SELECT IFNULL(SUM(amount),0) AS n FROM rta_expenses`);

    const totalRevenue  = Number(tripRevenue.n) + Number(incomeRevenue.n);
    const totalExpenses = Number(fuelExpense.n) + Number(maintExpense.n) + Number(repairExpense.n)
                        + Number(tyreExpense.n) + Number(batteryExpense.n) + Number(miscExpense.n)
                        + Number(rtaExpense.n);

    // ── Staff KPIs ──────────────────────────────────────────
    const [[totalDrivers]]  = await db.query(`SELECT COUNT(*) AS n FROM drivers WHERE status = 'Active'`);
    const [[driversOnTrip]] = await db.query(
      `SELECT COUNT(DISTINCT driver_id) AS n FROM trips WHERE trip_status IN ('Started','In Transit') AND is_deleted = 0 AND driver_id IS NOT NULL`
    );

    // ── Maintenance KPIs ────────────────────────────────────
    const [[pendingRepairs]]   = await db.query(`SELECT COUNT(*) AS n FROM repair_services WHERE status IN ('Reported','Under Repair','In Progress')`);
    const [[inWorkshop]]       = await db.query(`SELECT COUNT(*) AS n FROM vehicles WHERE vehicle_status = 'under_repair'`);
    const [[overdueServices]]  = await db.query(
      `SELECT COUNT(*) AS n FROM vehicle_services WHERE next_due IS NOT NULL AND odometer IS NOT NULL AND next_due <= odometer AND status != 'Completed'`
    );
    const [[upcomingPeriodic]] = await db.query(
      `SELECT COUNT(*) AS n FROM vehicle_services WHERE next_due IS NOT NULL AND odometer IS NOT NULL AND (next_due - odometer) BETWEEN 0 AND 2000 AND status != 'Completed'`
    );

    // Recent services
    const [recentServices] = await db.query(
      `SELECT vs.service_type AS type, vs.status, vs.service_date AS date,
              v.vehicle_no AS vehicle, IFNULL(vs.mechanic,'-') AS garage
       FROM vehicle_services vs
       JOIN vehicles v ON v.id = vs.vehicle_id
       ORDER BY vs.service_date DESC LIMIT 4`
    );

    // ── Fuel KPIs ───────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const [[fuelToday]]   = await db.query(`SELECT IFNULL(SUM(quantity),0) AS n FROM fuel_entries WHERE date = ?`, [today]);
    const [[fuelLitres]]  = await db.query(`SELECT IFNULL(SUM(quantity),0) AS n FROM fuel_entries`);
    // km_driven column may be named differently — use mileage or fall back to 0
    let fuelKm = { n: 0 };
    try {
      const [[km]] = await db.query(`SELECT IFNULL(SUM(km_driven),0) AS n FROM fuel_entries WHERE km_driven > 0`);
      fuelKm = km;
    } catch (_) {}
    const [topConsumer]   = await db.query(
      `SELECT v.vehicle_no, SUM(fe.quantity) AS litres
       FROM fuel_entries fe JOIN vehicles v ON v.id = fe.vehicle_id
       GROUP BY fe.vehicle_id ORDER BY litres DESC LIMIT 1`
    );
    const [recentFuel] = await db.query(
      `SELECT v.vehicle_no AS vehicle, fe.quantity AS litres, fe.total_cost AS cost,
              IFNULL(fe.station_name,'-') AS vendor, fe.date
       FROM fuel_entries fe JOIN vehicles v ON v.id = fe.vehicle_id
       ORDER BY fe.date DESC, fe.id DESC LIMIT 4`
    );
    const avgMileage = Number(fuelLitres.n) > 0
      ? +(Number(fuelKm.n) / Number(fuelLitres.n)).toFixed(2)
      : 0;

    // ── Driver / Settlement KPIs ────────────────────────────
    const [[pendingSettlements]] = await db.query(
      `SELECT COUNT(*) AS n FROM driver_settlements WHERE status IN ('Draft','Pending Approval')`
    );
    const [recentSettlements] = await db.query(
      `SELECT d.full_name AS driver, v.vehicle_no AS vehicle,
              ds.net_payable AS amount, ds.status, ds.statement_month AS month
       FROM driver_settlements ds
       JOIN drivers d ON d.id = ds.driver_id
       LEFT JOIN vehicles v ON v.id = ds.vehicle_id
       ORDER BY ds.created_at DESC LIMIT 4`
    );

    // ── Financial Summary (vendor outstanding) ───────────────
    // Financial outstanding — each query wrapped to survive missing columns
    let garageOut = { n: 0 }, fuelOut = { n: 0 }, partsOut = { n: 0 }, tyreOut = { n: 0 }, rtaOut = { n: 0 };
    try { [[garageOut]]  = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM repair_services WHERE status != 'Completed'`); } catch (_) {}
    try { [[fuelOut]]    = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM fuel_entries`); } catch (_) {}
    try { [[partsOut]]   = await db.query(`SELECT IFNULL(SUM(amount),0) AS n FROM parts_vendor_ledger WHERE transaction_type = 'Purchase'`); } catch (_) {}
    try { [[tyreOut]]    = await db.query(`SELECT IFNULL(SUM(tyre_cost),0) AS n FROM tyres`); } catch (_) {}
    try { [[rtaOut]]     = await db.query(`SELECT IFNULL(SUM(amount),0) AS n FROM rta_expenses`); } catch (_) {}

    // ── Inventory KPIs ──────────────────────────────────────
    const [[lowStock]]   = await db.query(`SELECT COUNT(*) AS n FROM inventory_parts WHERE current_stock > 0 AND current_stock <= min_stock`);
    const [[outOfStock]] = await db.query(`SELECT COUNT(*) AS n FROM inventory_parts WHERE current_stock = 0`);
    // purchase_orders table may not exist yet — fail gracefully
    let pendingPOs = { n: 0 };
    try {
      const [[po]] = await db.query(`SELECT COUNT(*) AS n FROM purchase_orders WHERE status IN ('Pending','Approved')`);
      pendingPOs = po;
    } catch (_) {}
    const [lowStockItems] = await db.query(
      `SELECT part_name AS name, current_stock AS stock, min_stock AS min,
              IF(current_stock = 0,'Out','Low') AS status
       FROM inventory_parts WHERE current_stock <= min_stock ORDER BY current_stock ASC LIMIT 6`
    );

    // ── Monthly Analytics (last 12 months) ──────────────────
    const [monthlyRevenue] = await db.query(
      `SELECT DATE_FORMAT(trip_date,'%b') AS month, MONTH(trip_date) AS m, YEAR(trip_date) AS y,
              SUM(freight_amount) AS revenue
       FROM trips WHERE is_deleted = 0 AND trip_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY y, m, DATE_FORMAT(trip_date,'%b') ORDER BY y, m`
    );
    const [monthlyExpenses] = await db.query(
      `SELECT DATE_FORMAT(date,'%b') AS month, MONTH(date) AS m, YEAR(date) AS y,
              SUM(total_cost) AS expenses
       FROM fuel_entries WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY y, m, DATE_FORMAT(date,'%b') ORDER BY y, m`
    );

    // Merge monthly revenue + expenses by month key
    const monthMap = {};
    monthlyRevenue.forEach(r => {
      const key = `${r.y}-${String(r.m).padStart(2,'0')}`;
      monthMap[key] = { month: r.month, revenue: Number(r.revenue), expenses: 0 };
    });
    monthlyExpenses.forEach(e => {
      const key = `${e.y}-${String(e.m).padStart(2,'0')}`;
      if (!monthMap[key]) monthMap[key] = { month: e.month, revenue: 0, expenses: 0 };
      monthMap[key].expenses += Number(e.expenses);
    });
    const monthly = Object.keys(monthMap).sort().map(k => monthMap[k]);

    // ── Fleet Status breakdown ───────────────────────────────
    const [[fleetRunning]] = await db.query(
      `SELECT COUNT(DISTINCT vehicle_id) AS n FROM trips WHERE trip_status IN ('Started','In Transit') AND is_deleted = 0`
    );
    const [[dueInspection]] = await db.query(
      `SELECT COUNT(*) AS n FROM inspection_defects WHERE status IN ('Open','In Progress')`
    );

    res.json({
      success: true,
      data: {
        kpi: {
          fleet: {
            total:            Number(fleetTotal.n),
            active:           Number(fleetActive.n),
            underMaintenance: Number(fleetRepair.n),
            available:        Math.max(0, Number(fleetTotal.n) - Number(fleetActive.n) - Number(fleetRepair.n)),
          },
          trips: {
            running:   Number(tripsRunning.n),
            completed: Number(tripsCompleted.n),
            cancelled: Number(tripsCancelled.n),
          },
          finance: {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
          },
          staff: {
            totalDrivers: Number(totalDrivers.n),
            onTrip:       Number(driversOnTrip.n),
            available:    Math.max(0, Number(totalDrivers.n) - Number(driversOnTrip.n)),
          },
        },
        analytics: { monthly },
        fleetStatus: {
          running:          Number(fleetRunning.n),
          idle:             Math.max(0, Number(fleetTotal.n) - Number(fleetRunning.n) - Number(fleetRepair.n)),
          underService:     Number(inWorkshop.n),
          dueForInspection: Number(dueInspection.n),
        },
        maintenance: {
          servicesDue:      Number(overdueServices.n),
          inWorkshop:       Number(inWorkshop.n),
          pendingRepairs:   Number(pendingRepairs.n),
          upcomingPeriodic: Number(upcomingPeriodic.n),
          recentServices,
        },
        fuel: {
          totalFuelCost:   Number(fuelExpense.n),
          fuelFilledToday: Number(fuelToday.n),
          averageMileage:  avgMileage,
          topConsumer:     topConsumer[0] ? { vehicle: topConsumer[0].vehicle_no, litres: Number(topConsumer[0].litres) } : { vehicle: '-', litres: 0 },
          recent:          recentFuel.map(r => ({ ...r, litres: Number(r.litres), cost: Number(r.cost) })),
        },
        driver: {
          total:              Number(totalDrivers.n),
          onTrip:             Number(driversOnTrip.n),
          available:          Math.max(0, Number(totalDrivers.n) - Number(driversOnTrip.n)),
          pendingSettlements: Number(pendingSettlements.n),
          recentSettlements:  recentSettlements.map(s => ({ ...s, amount: Number(s.amount) })),
        },
        financialSummary: {
          breakdown: [
            { name: 'Garage',      amount: Number(garageOut.n), color: 'bg-orange-500', light: 'bg-orange-50 text-orange-700 border-orange-200' },
            { name: 'Fuel Vendor', amount: Number(fuelOut.n),   color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-700 border-blue-200' },
            { name: 'Parts',       amount: Number(partsOut.n),  color: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200' },
            { name: 'Tyres',       amount: Number(tyreOut.n),   color: 'bg-yellow-500', light: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { name: 'RTA',         amount: Number(rtaOut.n),    color: 'bg-red-500',    light: 'bg-red-50 text-red-700 border-red-200' },
          ],
        },
        inventory: {
          lowStock:   Number(lowStock.n),
          outOfStock: Number(outOfStock.n),
          pendingPOs: Number(pendingPOs.n),
          items:      lowStockItems,
        },
      },
    });
  } catch (error) {
    console.error('GET KPIS ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================================
// GET /api/vehicles/:id/summary
// Per-vehicle integrated summary for Vehicle Details page.
// ==========================================================
const getVehicleSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const [[tripCount]]   = await db.query(`SELECT COUNT(*) AS n FROM trips WHERE vehicle_id = ? AND is_deleted = 0`, [id]);
    const [[fuelCost]]    = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM fuel_entries WHERE vehicle_id = ?`, [id]);
    const [[maintCost]]   = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM vehicle_services WHERE vehicle_id = ?`, [id]);
    const [[repairCost]]  = await db.query(`SELECT IFNULL(SUM(total_cost),0) AS n FROM repair_services WHERE vehicle_id = ?`, [id]);
    const [[tyreCost]]    = await db.query(`SELECT IFNULL(SUM(tyre_cost),0) AS n FROM tyres WHERE vehicle_id = ?`, [id]);
    const [[batteryCost]] = await db.query(`SELECT IFNULL(SUM(purchase_cost),0) AS n FROM batteries WHERE vehicle_id = ?`, [id]);
    const [[revenue]]     = await db.query(`SELECT IFNULL(SUM(freight_amount),0) AS n FROM trips WHERE vehicle_id = ? AND is_deleted = 0`, [id]);
    const [[incomeRev]]   = await db.query(`SELECT IFNULL(SUM(amount),0) AS n FROM income_entries WHERE vehicle_id = ?`, [id]);

    const totalRevenue  = Number(revenue.n) + Number(incomeRev.n);
    const totalExpenses = Number(fuelCost.n) + Number(maintCost.n) + Number(repairCost.n)
                        + Number(tyreCost.n) + Number(batteryCost.n);

    res.json({
      success: true,
      data: {
        tripCount:    Number(tripCount.n),
        fuelCost:     Number(fuelCost.n),
        maintCost:    Number(maintCost.n) + Number(repairCost.n),
        tyreCost:     Number(tyreCost.n),
        batteryCost:  Number(batteryCost.n),
        totalRevenue,
        totalExpenses,
        netProfit:    totalRevenue - totalExpenses,
      },
    });
  } catch (error) {
    console.error('GET VEHICLE SUMMARY ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getMaintenanceAlerts,
  getKpis,
  getVehicleSummary,
};
