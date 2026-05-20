const db = require('../config/db');
const InspectionDefect = require('../models/inspectionDefectModel');
const Service = require('../models/serviceModel');
const Repair = require('../models/repairModel');
const lifecycle = require('../services/maintenanceLifecycleService');

const BREAKDOWN_MAP = {
  tyre: 'Tyre',
  tread: 'Tyre',
  pressure: 'Tyre',
  sidewall: 'Tyre',
  wear: 'Tyre',
  brake: 'Brake',
  engine: 'Engine',
  oil: 'Engine',
  leak: 'Engine',
  electrical: 'Electrical',
  battery: 'Electrical',
  suspension: 'Suspension'
};

const PRIORITY_MAP = {
  critical: 'High',
  warning: 'Medium',
  minor: 'Low',
  failed: 'High'
};

const normalizeSeverity = (severity) => {
  if (!severity) return 'Medium';
  const value = severity.toString().toLowerCase();
  if (value.includes('critical') || value.includes('failed')) return 'Critical';
  if (value.includes('warning')) return 'Warning';
  if (value.includes('minor')) return 'Minor';
  return 'Warning';
};

const mapBreakdownType = (issueType) => {
  if (!issueType) return 'Other';
  const normalized = issueType.toString().toLowerCase();
  for (const [key, value] of Object.entries(BREAKDOWN_MAP)) {
    if (normalized.includes(key)) return value;
  }
  return 'Other';
};

const mapPriority = (severity) => {
  const normalized = severity.toString().toLowerCase();
  if (normalized.includes('critical') || normalized.includes('failed')) return 'High';
  if (normalized.includes('warning')) return 'Medium';
  if (normalized.includes('minor')) return 'Low';
  return 'Medium';
};

const toMysqlDateTime = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

exports.createInspectionDefect = async (req, res) => {
  try {
    const body = req.body;

    if (!body.inspection_id || !body.vehicle_id) {
      return res.status(400).json({ success: false, message: 'inspection_id and vehicle_id are required' });
    }

    const severity = normalizeSeverity(body.severity || body.issue_severity || body.result || 'Warning');
    const issueType = body.issue_type || body.issue || 'General issue';
    const breakdownType = mapBreakdownType(issueType);
    const priority = mapPriority(severity);

    const defect = {
      inspection_id: body.inspection_id,
      vehicle_id: body.vehicle_id,
      vehicle_no: body.vehicle_no || body.vehicle_number || null,
      issue_type: issueType,
      severity,
      breakdown_type: breakdownType,
      priority,
      description: body.description || body.issue_description || issueType,
      status: body.status || 'Open',
      reported_by: body.reported_by || 'Inspector',
      inspection_date: toMysqlDateTime(body.inspection_date),
      evidence_files: body.evidence_files ? JSON.stringify(body.evidence_files) : null,
      created_repair_id: body.created_repair_id || null,
      created_service_id: body.created_service_id || null,
    };

    const defectId = await InspectionDefect.create(defect);
    const savedDefect = await InspectionDefect.getById(defectId);
    await lifecycle.setVehicleStatusForLifecycle(defect.vehicle_id);
    if (savedDefect && savedDefect.evidence_files) {
      savedDefect.evidence_files = JSON.parse(savedDefect.evidence_files);
    }

    res.status(201).json({ success: true, data: savedDefect });
  } catch (error) {
    console.error('CREATE INSPECTION DEFECT ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to create inspection defect' });
  }
};

exports.getInspectionDefects = async (req, res) => {
  try {
    const defects = await InspectionDefect.getAll();
    const normalized = defects.map(defect => ({
      ...defect,
      evidence_files: defect.evidence_files ? JSON.parse(defect.evidence_files) : []
    }));
    res.status(200).json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    console.error('GET INSPECTION DEFECTS ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inspection defects' });
  }
};

exports.getInspectionDefectById = async (req, res) => {
  try {
    const defect = await InspectionDefect.getById(req.params.id);
    if (!defect) {
      return res.status(404).json({ success: false, message: 'Inspection defect not found' });
    }
    defect.evidence_files = defect.evidence_files ? JSON.parse(defect.evidence_files) : [];
    res.status(200).json({ success: true, data: defect });
  } catch (error) {
    console.error('GET INSPECTION DEFECT ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inspection defect' });
  }
};

exports.updateInspectionDefect = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const update = {
      issue_type: body.issue_type,
      severity: body.severity,
      breakdown_type: body.breakdown_type,
      priority: body.priority,
      description: body.description,
      status: body.status,
      reported_by: body.reported_by,
      evidence_files: body.evidence_files ? JSON.stringify(body.evidence_files) : undefined,
      created_repair_id: body.created_repair_id,
      created_service_id: body.created_service_id,
    };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
    await InspectionDefect.update(id, update);
    const defect = await InspectionDefect.getById(id);
    defect.evidence_files = defect.evidence_files ? JSON.parse(defect.evidence_files) : [];
    res.json({ success: true, data: defect });
  } catch (error) {
    console.error('UPDATE INSPECTION DEFECT ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to update inspection defect' });
  }
};

exports.createRepairFromInspectionDefect = async (req, res) => {
  try {
    const defectId = req.params.id;
    const defect = await InspectionDefect.getById(defectId);
    if (!defect) {
      return res.status(404).json({ success: false, message: 'Inspection defect not found' });
    }

    const repairPayload = {
      vehicle_id: defect.vehicle_id,
      vehicle_no: defect.vehicle_no,
      issue_description: defect.description,
      breakdown_type: defect.breakdown_type,
      reported_by: defect.reported_by,
      priority: defect.priority,
      odometer: defect.inspection_date ? null : null,
      service_date: defect.inspection_date || null,
      status: 'Reported',
      repair_notes: 'Auto-generated from inspection defect',
      inspection_id: defect.inspection_id,
      inspection_defect_id: defectId
    };

    const result = await Repair.create(repairPayload);
    await lifecycle.syncRepairLifecycle({
      ...repairPayload,
      id: result.insertId,
      status: 'Reported',
    });

    res.status(201).json({ success: true, message: 'Repair created from inspection', id: result.insertId });
  } catch (error) {
    console.error('CREATE REPAIR FROM INSPECTION ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to create repair from inspection' });
  }
};

exports.createPeriodicServiceFromInspection = async (req, res) => {
  try {
    const body = req.body;
    if (!body.vehicle_id || !body.service_type) {
      return res.status(400).json({ success: false, message: 'vehicle_id and service_type are required' });
    }
    const serviceDate = body.inspection_date || body.service_date || new Date().toISOString().split('T')[0];
    const odometer = Number(body.odometer || 0);
    const intervalConfig = {
      'Oil Change': 40000,
      'Hub Greasing': 80000,
      'General Check': 60000
    };
    const intervalKm = Number(body.interval_km || intervalConfig[body.service_type] || 50000);
    const nextDue = intervalKm ? odometer + intervalKm : null;

    const serviceId = await Service.createService({
      vehicle_id: body.vehicle_id,
      service_date: serviceDate,
      odometer: odometer || null,
      interval_km: intervalKm || null,
      next_due: nextDue || null,
      service_type: body.service_type,
      mechanic: body.mechanic || body.garage || null,
      labour_cost: Number(body.labour_cost) || 0,
      total_cost: Number(body.total_cost) || 0,
      status: body.status || 'Reported',
      work_description: body.description || `Periodic service created from inspection ${body.inspection_id || ''}`,
      completed_date: body.status === 'Completed' ? serviceDate : null
    });

    if (body.parts) {
      const parts = Array.isArray(body.parts) ? body.parts : JSON.parse(body.parts || '[]');
      await Service.addParts(serviceId, parts);
    }
    if (body.files) {
      await Service.addFiles(serviceId, Array.isArray(body.files) ? body.files : []);
    }

    if (body.inspection_defect_id) {
      await InspectionDefect.updateStatus(body.inspection_defect_id, 'Resolved', new Date(), null, serviceId);
    }

    res.status(201).json({ success: true, message: 'Periodic service created from inspection', serviceId });
  } catch (error) {
    console.error('CREATE PERIODIC SERVICE FROM INSPECTION ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to create periodic service from inspection' });
  }
};

exports.getDefectsByVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const defects = await InspectionDefect.getByVehicle(vehicleId);
    const normalized = defects.map(defect => ({
      ...defect,
      evidence_files: defect.evidence_files ? JSON.parse(defect.evidence_files) : []
    }));
    res.json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    console.error('GET DEFECTS BY VEHICLE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
