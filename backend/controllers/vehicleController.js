const Vehicle = require('../models/vehicleModel');

// @desc    Get all vehicles
// @route   GET /api/vehicles
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAll();
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.getById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 🔥 CREATE VEHICLE (UPDATED)
const createVehicle = async (req, res) => {
  try {
    // Basic validation
    if (!req.body.vehicle_no) {
      return res.status(400).json({
        success: false,
        message: 'vehicle_no is required'
      });
    }

    // 🔥 directly pass all fields
    const result = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: {
        id: result.insertId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 🔥 UPDATE VEHICLE (UPDATED)
const updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const existingVehicle = await Vehicle.getById(vehicleId);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    await Vehicle.update(vehicleId, req.body);

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const existingVehicle = await Vehicle.getById(vehicleId);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    await Vehicle.delete(vehicleId);

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getVehicleByNumber = async (req, res) => {
  try {
    const vehicle = await Vehicle.getByNumber(req.params.vehicle_no);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleByNumber  
};