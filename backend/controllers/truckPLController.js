const truckPLModel = require("../models/truckPLModel");

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const pad = (n) => String(n).padStart(2, "0");

// "2026-09" -> { startDate: "2026-09-01 00:00:00", endDate: "2026-09-30 23:59:59" }
// The end-of-day time keeps DATETIME columns (created_at) inclusive of the last day.
function monthRange(month) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    startDate: `${month}-01 00:00:00`,
    endDate: `${month}-${pad(lastDay)} 23:59:59`
  };
}

// Normalises ?month=YYYY-MM or ?startDate&endDate into a query range.
function resolvePeriod(query) {
  if (query.month && MONTH_RE.test(query.month)) {
    return { ...monthRange(query.month), month: query.month };
  }
  if (query.startDate && query.endDate) {
    const endDate = /^\d{4}-\d{2}-\d{2}$/.test(query.endDate) ? `${query.endDate} 23:59:59` : query.endDate;
    return { startDate: query.startDate, endDate, month: null };
  }
  return { startDate: null, endDate: null, month: null };
}

// Builds the full P&L for one vehicle over a date range (null = all time).
async function computeTruckPL(vehicleId, info, startDate, endDate) {
  const revenue = await truckPLModel.getRevenue(vehicleId, startDate, endDate);
  const fuel = await truckPLModel.getFuel(vehicleId, startDate, endDate);
  const fastag = await truckPLModel.getFastagExpenses(vehicleId, startDate, endDate);
  const maintenance = await truckPLModel.getMaintenance(vehicleId, startDate, endDate);
  const tyres = await truckPLModel.getTyres(vehicleId, info.vehicle_no, startDate, endDate);
  const battery = await truckPLModel.getBattery(vehicleId, startDate, endDate);
  const emi = await truckPLModel.getEmiCost(vehicleId, startDate, endDate);
  const driverSettlement = await truckPLModel.getDriverSettlement(vehicleId, startDate, endDate);
  const rta = await truckPLModel.getRTAExpenses(info.vehicle_no, startDate, endDate);
  const misc = await truckPLModel.getMiscExpenses(vehicleId, startDate, endDate);

  // ── STEP 3: Calculate totals ──
  const totalRevenue = revenue.totals.totalRevenue;

  // EMI and Driver Salary entries are already assigned to their dedicated
  // sections, so they must not be added through Miscellaneous as well.
  const totalExpenses =
    fuel.totalFuel +
    fuel.totalAdBlue +
    maintenance.totalMaintenance +
    tyres.totalTyres +
    battery.totalBattery +
    driverSettlement.netDriverCost +
    rta.totalRTA +
    misc.totalMisc +
    fastag.total +
    emi.totalEMI;

  const netProfit = totalRevenue - totalExpenses;

  const profitMargin = totalRevenue > 0
    ? Number(((netProfit / totalRevenue) * 100).toFixed(2))
    : 0;

  const totals = {
    totalRevenue,
    totalFuel: fuel.totalFuel,
    totalFastag: fastag.total,
    totalAdBlue: fuel.totalAdBlue,
    totalMaintenance: maintenance.totalMaintenance,
    totalTyres: tyres.totalTyres,
    totalBattery: battery.totalBattery,
    totalDriver: driverSettlement.netDriverCost,
    totalRTA: rta.totalRTA,
    totalMisc: misc.totalMisc,
    totalEMI: emi.totalEMI,
    totalExpenses,
    netProfit,
    profitMargin
  };

  return {
    revenue,
    fuel,
    fastag,
    maintenance,
    tyres,
    battery,
    emi,
    driverSettlement,
    rta,
    misc,
    totals
  };
}

// ========================================
// Individual Truck P&L (optionally for one month / date range)
// ========================================
const getTruckPL = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;

    const info = await truckPLModel.getTruckInfo(vehicleId);
    if (!info) {
      return res.status(404).json({
        success: false,
        message: "Truck not found"
      });
    }

    const { startDate, endDate, month } = resolvePeriod(req.query);
    const pl = await computeTruckPL(vehicleId, info, startDate, endDate);

    res.json({
      success: true,
      data: {
        info,
        period: startDate ? { month, from: startDate.slice(0, 10), to: endDate.slice(0, 10) } : null,
        ...pl
      }
    });

  } catch (error) {
    console.error('Error in getTruckPL:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========================================
// Fleet Profit & Loss List
// ========================================
const getTruckPLList = async (req, res) => {
  try {

    const { page, pageSize, search, startDate, endDate } = req.query;

    const { list, total } = await truckPLModel.getTruckPLList(
      startDate || null,
      endDate || null,
      {
        page: page || null,
        pageSize: pageSize || null,
        search: search || null
      }
    );

    res.json({
      success: true,
      data: list,
      meta: {
        total,
        page: page ? Number(page) : null,
        pageSize: pageSize ? Number(pageSize) : null
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getTruckPL,
  getTruckPLList
};