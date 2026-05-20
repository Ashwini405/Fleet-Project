const Repair = require('../models/repairModel');
const lifecycle = require('../services/maintenanceLifecycleService');

const buildRepairData = (source, totals) => ({
  vehicle_id: source.vehicle_id,
  vehicle_no: source.vehicle_no || null,
  model: source.model || null,
  driver_name: source.driver_name || null,
  previous_odometer: source.previous_odometer || null,
  issue_description: source.issue_description,
  breakdown_type: source.breakdown_type || null,
  vehicle_condition: source.vehicle_condition || null,
  breakdown_location: source.breakdown_location || null,
  reported_by: source.reported_by || null,
  priority: source.priority || null,
  service_date: source.service_date ? source.service_date.split('T')[0] : null,
  odometer: source.odometer || null,
  garage: source.garage || null,
  repair_start_time: source.repair_start_time || source.repair_start || null,
  repair_end_time: source.repair_end_time || source.repair_end || null,
  downtime: source.downtime || null,
  repair_notes: source.repair_notes || null,
  status: source.status || 'Reported',
  inspection_id: source.inspection_id || null,
  inspection_defect_id: source.inspection_defect_id || null,
  completed_date: source.status === 'Completed' ? new Date() : null,
  labour_cost: Number(source.labour_cost) || 0,
  parts: totals.parts,
  parts_total: totals.partsTotal,
  total_cost: totals.totalCost,
  files: source.files || null,
});

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

    const repairData = buildRepairData(data, {
      parts: JSON.stringify(parts),
      partsTotal,
      totalCost
    });

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

    await lifecycle.syncRepairLifecycle({
      ...repairData,
      id: result.insertId,
    });

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
      vehicle_no:         body.vehicle_no || null,
      model:              body.model || null,
      driver_name:        body.driver_name || null,
      previous_odometer:  body.previous_odometer || null,
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
      inspection_id:      body.inspection_id || null,
      inspection_defect_id: body.inspection_defect_id || null,
      completed_date:     body.status === 'Completed' ? new Date() : null,
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

    await lifecycle.syncRepairLifecycle({ ...data, id });

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
