const Inspection = require('../models/inspectionModel');


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

    res.status(200).json({
      success: true,
      data: inspections
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

    res.status(200).json({
      success: true,
      data: inspection
    });

  } catch (error) {

    console.error('GET INSPECTION ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection'
    });

  }

};