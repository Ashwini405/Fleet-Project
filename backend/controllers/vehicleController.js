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

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 🔥 CREATE VEHICLE (WITH FILE SUPPORT)
const createVehicle = async (req, res) => {
  try {
    if (!req.body.vehicle_no) {
      return res.status(400).json({
        success: false,
        message: 'vehicle_no is required'
      });
    }

    // Duplicate check
    const existing = await Vehicle.getByNumber(req.body.vehicle_no);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Vehicle "${req.body.vehicle_no}" already exists in the fleet.`
      });
    }

    const files = req.files || {};

    // Strip empty strings to avoid inserting '' into integer/date columns
    const cleanBody = {};
    Object.entries(req.body).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        cleanBody[key] = val;
      }
    });

    const data = {
      ...cleanBody,
      insurance_document: files.insurance_document?.[0]?.filename || null,
      fc_document: files.fc_document?.[0]?.filename || null,
      permit_document: files.permit_document?.[0]?.filename || null,
      tax_document: files.tax_document?.[0]?.filename || null,
      pollution_document: files.pollution_document?.[0]?.filename || null,
      cll_document: files.cll_document?.[0]?.filename || null,
      rc_document: files.rc_document?.[0]?.filename || null
    };

    const result = await Vehicle.create(data);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('createVehicle error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// 🔥 UPDATE VEHICLE (KEEP OLD FILES IF NOT REPLACED)
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

    const files = req.files || {};

    // Strip empty strings so FK integer columns don't get '' which causes SQL errors
    const cleanBody = {};
    Object.entries(req.body).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        cleanBody[key] = val;
      }
    });

    const data = {
      ...cleanBody,
      insurance_document: files.insurance_document?.[0]?.filename || existingVehicle.insurance_document,
      fc_document: files.fc_document?.[0]?.filename || existingVehicle.fc_document,
      permit_document: files.permit_document?.[0]?.filename || existingVehicle.permit_document,
      tax_document: files.tax_document?.[0]?.filename || existingVehicle.tax_document,
      pollution_document: files.pollution_document?.[0]?.filename || existingVehicle.pollution_document,
      cll_document: files.cll_document?.[0]?.filename || existingVehicle.cll_document,
      rc_document: files.rc_document?.[0]?.filename || existingVehicle.rc_document
    };

    await Vehicle.update(vehicleId, data);

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully'
    });

  } catch (error) {
    console.error('updateVehicle error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
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

// @desc    Get vehicle by number
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
// @desc  Check if vehicle is available (no active trip)
const checkAvailability = async (req, res) => {
  try {
    const db = require('../config/db');
    const vehicle_no = req.params.vehicle_no;

    const vehicle = await Vehicle.getByNumber(vehicle_no);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const [activeTrips] = await db.query(
      `SELECT trip_id, trip_status, destination FROM trips
       WHERE vehicle_id = ? AND trip_status IN ('Active', 'In Transit', 'Planned', 'Started')
       LIMIT 1`,
      [vehicle.id]
    );

    const isAvailable = activeTrips.length === 0;

    res.json({
      success: true,
      available: isAvailable,
      activeTrip: activeTrips[0] || null,
      vehicleStatus: vehicle.vehicle_status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { vehicle_id, type, validity } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    let columnDoc = '';
    let columnDate = '';

    switch (type) {
      case 'Insurance':
        columnDoc = 'insurance_document';
        columnDate = 'insurance_validity';
        break;

      case 'FC (Fitness)':
        columnDoc = 'fc_document';
        columnDate = 'fc_validity';
        break;

      case 'Tax':
        columnDoc = 'tax_document';
        columnDate = 'tax_validity';
        break;

      case 'Pollution':
        columnDoc = 'pollution_document';
        columnDate = 'pollution_validity';
        break;

      case 'Permit':
        columnDoc = 'permit_document';
        columnDate = 'permit_validity';
        break;

      case 'CLL':
        columnDoc = 'cll_document';
        columnDate = 'cll_validity';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid document type"
        });
    }

    const db = require('../config/db');

    await db.query(
      `UPDATE vehicles SET ${columnDoc} = ?, ${columnDate} = ? WHERE id = ?`,
      [req.file.filename, validity, vehicle_id]
    );

    res.json({
      success: true,
      message: "Document uploaded successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleByNumber,
  uploadDocument,
  checkAvailability
};