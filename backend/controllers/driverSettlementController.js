const driverSettlementModel =
require("../models/driverSettlementModel");

// ======================================
// Get Plants
// ======================================
const getPlants = async (req, res) => {
  try {
    const plants =
      await driverSettlementModel.getPlants();

    res.status(200).json({
      success: true,
      data: plants,
    });
  } catch (error) {
    console.error("Get Plants Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Vehicles By Plant
// ======================================
const getVehiclesByPlant = async (
  req,
  res
) => {
  try {
    const vehicles =
      await driverSettlementModel.getVehiclesByPlant(
        req.params.plant
      );

    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get Vehicles Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Driver Details
// ======================================
const getDriverByVehicle = async (
  req,
  res
) => {
  try {

    const vehicleNo =
      req.params.vehicleNo;

    const month =
      req.query.month;

    const driver =
      await driverSettlementModel.getDriverByVehicle(
        vehicleNo
      );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    let tripData = {
      total_trips: 0,
      total_advance: 0,
    };

    if (
      driver.driver_id &&
      month
    ) {
      tripData =
        await driverSettlementModel.getDriverDetails(
          driver.driver_id,
          month
        );
    }

    res.status(200).json({
      success: true,
      data: {
        ...driver,
        ...tripData,
      },
    });

  } catch (error) {

    console.error(
      "Get Driver Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Save Settlement
// ======================================
const createSettlement = async (
  req,
  res
) => {
  try {

    await driverSettlementModel.createSettlement(
      req.body
    );

    res.status(201).json({
      success: true,
      message:
        "Settlement saved successfully",
    });

  } catch (error) {

    console.error(
      "Create Settlement Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Settlements
// ======================================
const getSettlements = async (
  req,
  res
) => {
  try {

    const settlements =
      await driverSettlementModel.getSettlements();

    res.status(200).json({
      success: true,
      data: settlements,
    });

  } catch (error) {

    console.error(
      "Get Settlements Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Pending Settlements
// ======================================
const getPendingSettlements =
async (req, res) => {
  try {

    const data =
      await driverSettlementModel.getPendingSettlements();

    res.json({
      success: true,
      data,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Settlement History
// ======================================
const getSettlementHistory =
async (req, res) => {
  try {

    const data =
      await driverSettlementModel.getSettlements();

    res.json({
      success: true,
      data,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Approve Settlement
// ======================================
const approveSettlement =
async (req, res) => {
  try {

    await driverSettlementModel.approveSettlement(
      req.params.id
    );

    res.json({
      success: true,
      message:
        "Settlement approved successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Reject Settlement
// ======================================
const rejectSettlement =
async (req, res) => {
  try {

    await driverSettlementModel.rejectSettlement(
      req.params.id,
      req.body.reason
    );

    res.json({
      success: true,
      message:
        "Settlement rejected successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Mark Paid
// ======================================
const markSettlementPaid =
async (req, res) => {
  try {

    await driverSettlementModel.markSettlementPaid(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message:
        "Settlement marked as paid",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Duplicate Settlement
// ======================================
const duplicateSettlement =
async (req, res) => {
  try {

    await driverSettlementModel.duplicateSettlement(
      req.params.id
    );

    res.json({
      success: true,
      message:
        "Settlement duplicated successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPlants,
  getVehiclesByPlant,
  getDriverByVehicle,
  createSettlement,
  getSettlements,
  getPendingSettlements,
  getSettlementHistory,
  approveSettlement,
  rejectSettlement,
  markSettlementPaid,
  duplicateSettlement,
};