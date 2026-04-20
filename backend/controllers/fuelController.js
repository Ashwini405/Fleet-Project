const Fuel = require('../models/fuelModel');


// ✅ CREATE
const createFuel = async (req, res) => {
  try {
    console.log("FUEL DATA:", req.body);

    const result = await Fuel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Fuel entry created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


// ✅ GET ALL
const getFuelEntries = async (req, res) => {
  try {
    const data = await Fuel.getAll();

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// ✅ GET BY VEHICLE
const getFuelByVehicle = async (req, res) => {
  try {
    const data = await Fuel.getByVehicle(req.params.vehicleId);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// ✅ GET BY TRIP
const getFuelByTrip = async (req, res) => {
  try {
    const data = await Fuel.getByTrip(req.params.tripId);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


module.exports = {
  createFuel,
  getFuelEntries,
  getFuelByVehicle,
  getFuelByTrip
};