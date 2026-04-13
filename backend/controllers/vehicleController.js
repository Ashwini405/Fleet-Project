const Vehicle = require('../models/vehicleModel');

// @desc    Get all vehicles
// @route   GET /api/vehicles
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAll();
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
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
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
const createVehicle = async (req, res) => {
  try {
    const { vehicle_no, type } = req.body;
    
    // Basic validation
    if (!vehicle_no || !type) {
      return res.status(400).json({ success: false, message: 'Please provide vehicle_no and type' });
    }

    const newVehicle = await Vehicle.create({ vehicle_no, type });
    res.status(201).json({ 
      success: true, 
      message: 'Vehicle created successfully',
      data: { id: newVehicle.insertId, vehicle_no, type }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
const updateVehicle = async (req, res) => {
  try {
    const { vehicle_no, type } = req.body;
    const vehicleId = req.params.id;

    // Check if vehicle exists
    const existingVehicle = await Vehicle.getById(vehicleId);
    if (!existingVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await Vehicle.update(vehicleId, { vehicle_no, type });
    res.status(200).json({ 
      success: true, 
      message: 'Vehicle updated successfully',
      data: { id: vehicleId, vehicle_no, type } 
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

    // Check if vehicle exists
    const existingVehicle = await Vehicle.getById(vehicleId);
    if (!existingVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await Vehicle.delete(vehicleId);
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
