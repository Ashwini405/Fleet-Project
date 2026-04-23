const Fuel = require('../models/fuelModel');

// ✅ CREATE FUEL ENTRY
const createFuel = async (req, res) => {
  try {
    let {
      trip_id,
      vehicle_id,
      date,
      quantity,
      rate,
      total_cost,
      vendor
    } = req.body;

    // 🔥 REQUIRED VALIDATION
    if (!trip_id) {
      return res.status(400).json({
        success: false,
        message: "Trip is required"
      });
    }

    if (!vehicle_id) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is required"
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      });
    }

    if (!rate || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: "Rate must be greater than 0"
      });
    }

    // 🔥 AUTO CALCULATE TOTAL COST
    total_cost = quantity * rate;

    const fuelData = {
      trip_id,
      vehicle_id,
      date,
      quantity,
      rate,
      total_cost,
      vendor
     
    };

    const result = await Fuel.create(fuelData);

    res.status(201).json({
      success: true,
      message: "Fuel entry added successfully",
      data: {
        id: result.insertId,
        ...fuelData
      }
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