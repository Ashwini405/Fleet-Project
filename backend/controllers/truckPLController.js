const truckPLModel = require("../models/truckPLModel");

// ========================================
// Truck Header
// ========================================
const getTruckPL = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;

    // ── STEP 1: Get truck info and validate ──
    const info = await truckPLModel.getTruckInfo(vehicleId);

    // ── IMPORTANT: Check if truck exists BEFORE using info ──
    if (!info) {
      return res.status(404).json({
        success: false,
        message: "Truck not found"
      });
    }

    // ── STEP 2: Fetch all financial data ──
    const revenue = await truckPLModel.getRevenue(vehicleId);
    const fuel = await truckPLModel.getFuel(vehicleId);
    const maintenance = await truckPLModel.getMaintenance(vehicleId);
    const tyres = await truckPLModel.getTyres(vehicleId);
    const battery = await truckPLModel.getBattery(vehicleId);
    const emi = await truckPLModel.getEmiCost(vehicleId);
    const driverSettlement = await truckPLModel.getDriverSettlement(vehicleId);
    const rta = await truckPLModel.getRTAExpenses(info.vehicle_no);
    const misc = await truckPLModel.getMiscExpenses(vehicleId);

    // ── STEP 3: Calculate totals ──
    const totalRevenue = revenue.totals.totalRevenue;

    // misc.totalMisc already folds in any manually-logged 'EMI' expense rows
    // (misc.totalEMI is that subset, split out for display only). emi.totalEMI
    // is a separate, genuinely new source — actual EMI-paid records × the
    // vehicle's fixed installment — so it's added on top, not double-counted.
    const totalExpenses =
      fuel.totalFuel +
      fuel.totalAdBlue +
      maintenance.totalMaintenance +
      tyres.totalTyres +
      battery.totalBattery +
      driverSettlement.netDriverCost +
      rta.totalRTA +
      misc.totalMisc +
      emi.totalEMI;

    const netProfit = totalRevenue - totalExpenses;

    const profitMargin = totalRevenue > 0
      ? Number(((netProfit / totalRevenue) * 100).toFixed(2))
      : 0;

    const totals = {
      totalRevenue,
      totalFuel: fuel.totalFuel,
      totalAdBlue: fuel.totalAdBlue,
      totalMaintenance: maintenance.totalMaintenance,
      totalTyres: tyres.totalTyres,
      totalBattery: battery.totalBattery,
      totalDriver: driverSettlement.netDriverCost,
      totalRTA: rta.totalRTA,
      totalMisc: misc.totalMisc - misc.totalEMI,
      totalEMI: misc.totalEMI + emi.totalEMI,
      totalExpenses,
      netProfit,
      profitMargin
    };

    // ── STEP 4: Send response ──
    res.json({
      success: true,
      data: {
        info,
        revenue,
        fuel,
        maintenance,
        tyres,
        battery,
        emi,
        driverSettlement,
        rta,
        misc,
        totals
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