const LabourVendor = require("../models/labourVendorModel");
const { logAudit } = require("../middleware/auditMiddleware");

// GET ALL
exports.getAllLabourVendors = async (req, res) => {
  try {
    const data = await LabourVendor.getAll();

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE
exports.getLabourVendorById = async (req, res) => {
  try {
    const data = await LabourVendor.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ success: false, message: "Labour Vendor not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
exports.createLabourVendor = async (req, res) => {
  try {
    const result = await LabourVendor.create(req.body);

    await logAudit(req, {
      module_name: "Vendor",
      action: "CREATE",
      description: `Created Labour vendor "${req.body.vendor_name}".`,
      new_data: req.body,
    });

    res.status(201).json({
      success: true,
      message: "Labour Vendor Created Successfully",
      insertId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
exports.updateLabourVendor = async (req, res) => {
  try {
    await LabourVendor.update(req.params.id, req.body);

    await logAudit(req, {
      module_name: "Vendor",
      action: "UPDATE",
      description: `Updated Labour vendor #${req.params.id}.`,
      new_data: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Labour Vendor Updated Successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
