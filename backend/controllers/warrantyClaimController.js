const WarrantyClaimModel = require('../models/warrantyClaimModel');

// ======================================================
// CREATE CLAIM
// ======================================================

const createWarrantyClaim = async (req, res) => {
  try {
    const body = req.body;

    // ======================================================
    // FILES
    // ======================================================

    const item_photos = req.files?.item_photos
      ? JSON.stringify(req.files.item_photos.map(file => file.filename))
      : JSON.stringify([]);

    const invoice_copy = req.files?.invoice_copy
      ? JSON.stringify(req.files.invoice_copy.map(file => file.filename))
      : JSON.stringify([]);

    const warranty_card_copy = req.files?.warranty_card_copy
      ? JSON.stringify(req.files.warranty_card_copy.map(file => file.filename))
      : JSON.stringify([]);

    const complaint_report = req.files?.complaint_report
      ? JSON.stringify(req.files.complaint_report.map(file => file.filename))
      : JSON.stringify([]);

    const additional_documents = req.files?.additional_documents
      ? JSON.stringify(req.files.additional_documents.map(file => file.filename))
      : JSON.stringify([]);

    const data = {
      ...body,
      item_photos,
      invoice_copy,
      warranty_card_copy,
      complaint_report,
      additional_documents
    };

    const result = await WarrantyClaimModel.createWarrantyClaim(data);

    res.status(201).json({
      success: true,
      message: 'Warranty Claim Created Successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('CREATE WARRANTY CLAIM ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// ======================================================
// GET ALL CLAIMS
// ======================================================

const getWarrantyClaims = async (req, res) => {
  try {
    const claims = await WarrantyClaimModel.getWarrantyClaims();
    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// ======================================================
// GET CLAIM BY ID
// ======================================================

const getWarrantyClaimById = async (req, res) => {
  try {
    const claim = await WarrantyClaimModel.getWarrantyClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim Not Found'
      });
    }
    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// ======================================================
// SAFE JSON FILE FORMAT
// ======================================================

const safeJsonFiles = (value) => {
  try {
    if (!value) {
      return JSON.stringify([]);
    }
    if (typeof value === 'string') {
      JSON.parse(value); // test if it's already valid JSON
      return value;
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return JSON.stringify([value]);
  } catch {
    return JSON.stringify([value]);
  }
};

// ======================================================
// UPDATE CLAIM
// ======================================================

const updateWarrantyClaim = async (req, res) => {
  try {
    const body = req.body;
    const existingClaim = await WarrantyClaimModel.getWarrantyClaimById(req.params.id);

    if (!existingClaim) {
      return res.status(404).json({
        success: false,
        message: 'Claim Not Found'
      });
    }

    // ======================================================
    // FILES (keep old files if no new ones are uploaded)
    // ======================================================

    const item_photos = req.files?.item_photos
      ? JSON.stringify(req.files.item_photos.map(file => file.filename))
      : safeJsonFiles(existingClaim.item_photos);

    const invoice_copy = req.files?.invoice_copy
      ? JSON.stringify(req.files.invoice_copy.map(file => file.filename))
      : safeJsonFiles(existingClaim.invoice_copy);

    const warranty_card_copy = req.files?.warranty_card_copy
      ? JSON.stringify(req.files.warranty_card_copy.map(file => file.filename))
      : safeJsonFiles(existingClaim.warranty_card_copy);

    const complaint_report = req.files?.complaint_report
      ? JSON.stringify(req.files.complaint_report.map(file => file.filename))
      : safeJsonFiles(existingClaim.complaint_report);

    const additional_documents = req.files?.additional_documents
      ? JSON.stringify(req.files.additional_documents.map(file => file.filename))
      : safeJsonFiles(existingClaim.additional_documents);

    const data = {
      ...body,
      item_photos,
      invoice_copy,
      warranty_card_copy,
      complaint_report,
      additional_documents
    };

    await WarrantyClaimModel.updateWarrantyClaim(req.params.id, data);

    res.status(200).json({
      success: true,
      message: 'Warranty Claim Updated Successfully'
    });
  } catch (error) {
    console.error('UPDATE WARRANTY CLAIM ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  createWarrantyClaim,
  getWarrantyClaims,
  getWarrantyClaimById,
  updateWarrantyClaim
};