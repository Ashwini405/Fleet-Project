const Fuel = require('../models/fuelModel');

// ✅ CREATE FUEL ENTRY
const createFuel = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const {
      trip_id,
      vehicle_id,
      vehicle_no,
      date,

      fuel_type,
      station_name,
      payment_method,

      driver_name,
      previous_odo,
      expected_mileage,
      tank_capacity,

      current_odo,
      distance,

      quantity,
      rate,
      mileage,

      bill_number,
      full_tank,

      vendor,
      vendor_type,

      location,
      filled_by,
      remarks
    } = req.body;

    const total_cost = quantity * rate;

    // ✅ SAFE & COMPLETE OBJECT
    const fuelData = {
      trip_id: trip_id || null,
      vehicle_id: vehicle_id || null,
      vehicle_no: vehicle_no || null,
      date: date || null,

      fuel_type: fuel_type || null,
      station_name: station_name || null,
      payment_method: payment_method || null,

      driver_name: driver_name || null,
      previous_odo: previous_odo || null,
      expected_mileage: expected_mileage || null,
      tank_capacity: tank_capacity || null,

      current_odo: current_odo || null,
      distance: distance || null,

      quantity: quantity || 0,
      rate: rate || 0,
      total_cost: total_cost || 0,
      mileage: mileage || null,

      bill_number: bill_number || null,
      full_tank: full_tank || false,

      vendor: vendor || null,
      vendor_type: vendor_type || null,

      location: location || null,
      filled_by: filled_by || null,
      remarks: remarks || null
    };

    const result = await Fuel.create(fuelData);

    res.status(201).json({
      success: true,
      message: "Fuel entry added successfully",
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error("CREATE FUEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ GET ALL FUEL ENTRIES
const getFuelEntries = async (req, res) => {
  try {
    const data = await Fuel.getAll();

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET ALL FUEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ GET BY VEHICLE
const getFuelByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const data = await Fuel.getByVehicle(vehicleId);

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET FUEL BY VEHICLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ GET BY TRIP (MOST IMPORTANT)
const getFuelByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const data = await Fuel.getByTrip(tripId);

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET FUEL BY TRIP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ UPDATE FUEL ENTRY
const updateFuel = async (req, res) => {
  try {
    const { id } = req.params;
    let { quantity, rate } = req.body;

    // 🔥 Recalculate total cost if quantity or rate is updated
    if (quantity && rate) {
      req.body.total_cost = quantity * rate;
    }

    await Fuel.update(id, req.body);

    res.json({
      success: true,
      message: "Fuel entry updated successfully"
    });

  } catch (error) {
    console.error("UPDATE FUEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ DELETE FUEL ENTRY
const deleteFuel = async (req, res) => {
  try {
    const { id } = req.params;
    await Fuel.delete(id);

    res.json({
      success: true,
      message: "Fuel entry deleted successfully"
    });

  } catch (error) {
    console.error("DELETE FUEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = {
  createFuel,
  getFuelEntries,
  getFuelByVehicle,
  getFuelByTrip,
  updateFuel,
  deleteFuel
};