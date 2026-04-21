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

    const files = req.files || {};

    const data = {
      ...req.body,

      // 🔥 DOCUMENTS
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
      data: {
        id: result.insertId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
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

    const data = {
      ...req.body,

      // 🔥 KEEP OLD IF NEW NOT UPLOADED
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
  uploadDocument // ✅ ADD THIS
};