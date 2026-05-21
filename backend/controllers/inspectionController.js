const Inspection = require('../models/inspectionModel');
const db = require('../config/db');
const lifecycle = require('../services/maintenanceLifecycleService');

const parseChecklist = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const enrichInspection = async (inspection) => {
  const [defects] = await db.query(
    `
      SELECT
        d.*,
        r.id AS repair_id,
        r.status AS repair_status,
        r.completed_date AS repair_completed_date,
        r.repair_start_time,
        r.repair_end_time
      FROM inspection_defects d
      LEFT JOIN repair_services r
        ON r.id = d.created_repair_id
        OR r.inspection_defect_id = d.id
      WHERE d.inspection_id = ?
         OR d.inspection_id = ?
      ORDER BY d.created_at DESC
    `,
    [inspection.inspection_number, inspection.id]
  );

  const checklist = parseChecklist(inspection.checklist_results);
  const failedItems = checklist.filter((item) => {
    const status = (item.status || item.result || '').toString().toLowerCase();
    return status === 'fail' || status === 'failed';
  });

  return {
    ...inspection,
    defects,
    defect_status: defects[0]?.status || null,
    repair_id: defects[0]?.repair_id || null,
    repair_status: defects[0]?.repair_status || null,
    repair_progress: defects[0]?.repair_status || (defects[0] ? 'Repair Created' : null),
    repair_completed_date: defects[0]?.repair_completed_date || null,
    recommendations: lifecycle.buildRecommendationsFromItems(failedItems),
  };
};


// ======================================================
// CREATE INSPECTION
// ======================================================

exports.createInspection = async (req, res) => {

  try {

    const result = await Inspection.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Inspection created successfully',
      insertId: result.insertId
    });

  } catch (error) {

    console.error('CREATE INSPECTION ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create inspection'
    });

  }

};


// ======================================================
// GET ALL INSPECTIONS
// ======================================================

exports.getInspections = async (req, res) => {

  try {

    const inspections = await Inspection.getAll();
    const enriched = await Promise.all(inspections.map(enrichInspection));

    res.status(200).json({
      success: true,
      data: enriched
    });

  } catch (error) {

    console.error('GET INSPECTIONS ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspections'
    });

  }

};


// ======================================================
// GET INSPECTION BY ID
// ======================================================

exports.getInspectionById = async (req, res) => {

  try {

    const inspection = await Inspection.getById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    const enriched = await enrichInspection(inspection);

    res.status(200).json({
      success: true,
      data: enriched
    });

  } catch (error) {

    console.error('GET INSPECTION ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection'
    });

  }

};
