const Vehicle = require('../models/vehicleModel');
const db = require('../config/db'); // imported once for reuse

// @desc    Get all vehicles
// @route   GET /api/vehicles
const getVehicles = async (req, res) => {

  try {

    const [vehicles] = await db.query(`

      SELECT

        v.id,
        v.vehicle_no,
        v.default_route,

        v.type,
        v.initial_odometer,

        v.make_brand,
        v.fuel_type,
        v.model_year,
        v.body_type,

        v.gps_device_id,
        v.fastag_id,

        v.vehicle_status,

        d.id AS driver_id,
        d.full_name AS driver_name,
        d.mobile AS driver_phone,

        s.id AS station_id,
        s.station_name,

        sp.id AS supervisor_id,
        sp.full_name AS supervisor_name,
        sp.mobile AS supervisor_phone

      FROM vehicles v

      LEFT JOIN drivers d
      ON v.assigned_driver = d.id

      LEFT JOIN stations s
      ON v.station_id = s.id

      LEFT JOIN supervisors sp
      ON v.supervisor_id = sp.id

      ORDER BY v.vehicle_no ASC

    `);

    res.status(200).json({

      success: true,

      count: vehicles.length,

      data: vehicles

    });

  } catch (error) {

    console.error(

      'GET VEHICLES ERROR:',
      error
    );

    res.status(500).json({

      success: false,

      message: 'Server Error'
    });
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

// 🔥 CREATE VEHICLE (WITH FILE SUPPORT + DEBUG LOGS)
const createVehicle = async (req, res) => {
  try {
    // 🔍 DEBUG: log incoming request
    console.log("📥 CREATE VEHICLE REQ BODY:", req.body);
    console.log("📎 FILES:", req.files);

    if (!req.body.vehicle_no) {
      return res.status(400).json({
        success: false,
        message: 'vehicle_no is required'
      });
    }

    // Duplicate check – robust detection
    const existing = await Vehicle.getByNumber(req.body.vehicle_no);
    if (existing && existing.id) {   // ✅ ensure vehicle really exists
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
    console.log("✅ INSERT RESULT:", result);  // 🔍 DEBUG

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

// 🔥 DELETE VEHICLE (with foreign key cleanup)
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

    // 🔥 delete child records (fuel_entries) first to avoid FK constraint
    await db.query("DELETE FROM fuel_entries WHERE vehicle_id = ?", [vehicleId]);

    // then delete the vehicle
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

// 🔥 GET VEHICLE BY NUMBER (with URL decoding)
const getVehicleByNumber = async (req, res) => {
  try {
    // Decode the vehicle number (handles spaces like "TG 12 AP 1233")
    let vehicle_no = decodeURIComponent(req.params.vehicle_no);
    const vehicle = await Vehicle.getByNumber(vehicle_no);

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

// 🔥 CHECK VEHICLE AVAILABILITY (with URL decoding)
const checkAvailability = async (req, res) => {
  try {
    // Decode the vehicle number
    let vehicle_no = decodeURIComponent(req.params.vehicle_no);

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

// 📄 UPLOAD DOCUMENT (unchanged)
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