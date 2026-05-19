const Repair = require('../models/repairModel');

// ✅ CREATE REPAIR
const createRepair = async (req, res) => {
  try {
    const data = req.body;

    if (!data.vehicle_id) {
      return res.status(400).json({ success: false, message: "Vehicle is required" });
    }

    if (!data.issue_description) {
      return res.status(400).json({ success: false, message: "Issue description required" });
    }

    const parts = (() => {
      try { return JSON.parse(data.parts || '[]'); } catch { return []; }
    })();

    const partsTotal = parts.reduce((sum, p) => {
      return sum + (Number(p.costPerUnit) * Number(p.qty) || 0);
    }, 0);

    const totalCost = partsTotal + (Number(data.labour_cost) || 0);

    const repairData = {
      ...data,
      service_date: data.service_date ? data.service_date.split('T')[0] : null,
      repair_start_time: data.repair_start_time || data.repair_start || null,
      repair_end_time: data.repair_end_time || data.repair_end || null,
      parts: JSON.stringify(parts),
      parts_total: partsTotal,
      total_cost: totalCost
    };

    // 🔥 FIX FILES
    if (req.files && req.files.length > 0) {
      repairData.files = JSON.stringify(
        req.files.map(file => ({
          file_name: file.filename,
          file_type: file.mimetype
        }))
      );
    }

    const result = await Repair.create(repairData);

    res.status(201).json({
      success: true,
      message: "Repair created successfully",
      id: result.insertId
    });

  } catch (error) {
    console.error("CREATE REPAIR ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ GET ALL
const getAllRepairs = async (req, res) => {
  try {
    const data = await Repair.getAll();

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ GET BY VEHICLE
const getRepairsByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const data = await Repair.getByVehicle(vehicleId);

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET BY VEHICLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ GET BY ID
const getRepairById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Repair.getById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Repair not found'
      });
    }

    let parsedParts = [];
    let parsedFiles = [];

    try {
      parsedParts = Array.isArray(data.parts) ? data.parts : JSON.parse(data.parts || '[]');
    } catch { parsedParts = []; }

    try {
      parsedFiles = Array.isArray(data.files) ? data.files : JSON.parse(data.files || '[]');
    } catch { parsedFiles = []; }

    res.json({
      success: true,
      data: {
        ...data,
        parts: parsedParts,
        files: parsedFiles
      }
    });

  } catch (error) {
    console.error("GET REPAIR ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
const updateRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const parts = (() => {
      try { return JSON.parse(body.parts || '[]'); } catch { return []; }
    })();
    const partsTotal = parts.reduce((sum, p) => sum + (Number(p.qty) * Number(p.costPerUnit) || 0), 0);
    const totalCost = partsTotal + (Number(body.labour_cost) || 0);

    const data = {
      vehicle_id:         body.vehicle_id,
      issue_description:  body.issue_description,
      breakdown_type:     body.breakdown_type,
      vehicle_condition:  body.vehicle_condition,
      breakdown_location: body.breakdown_location,
      reported_by:        body.reported_by,
      priority:           body.priority,
      service_date:       body.service_date ? body.service_date.split('T')[0] : null,
      odometer:           body.odometer || null,
      garage:             body.garage || null,
      repair_start_time:  body.repair_start_time || null,
      repair_end_time:    body.repair_end_time || null,
      downtime:           body.downtime || null,
      repair_notes:       body.repair_notes || null,
      status:             body.status,
      labour_cost:        Number(body.labour_cost) || 0,
      parts:              JSON.stringify(parts),
      parts_total:        partsTotal,
      total_cost:         totalCost,
    };

    if (req.files && req.files.length > 0) {
      data.files = JSON.stringify(
        req.files.map(file => ({ file_name: file.filename, file_type: file.mimetype }))
      );
    } else if (body.files) {
      data.files = body.files;
    }

    await Repair.update(id, data);

    res.json({ success: true, message: 'Updated successfully' });

  } catch (error) {
    console.error('UPDATE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ DELETE
const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;

    await Repair.delete(id);

    res.json({
      success: true,
      message: "Deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = {
  createRepair,
  getAllRepairs,
  getRepairsByVehicle,
  getRepairById,
  updateRepair,
  deleteRepair
};