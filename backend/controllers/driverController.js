const Driver = require('../models/driverModel');


exports.createDriver = async (req, res) => {
  try {
    const data = {
      ...req.body,
      profile_photo: req.files?.profile_photo?.[0]?.filename || null,
      id_proof: req.files?.id_proof?.[0]?.filename || null,
      bank_document: req.files?.bank_document?.[0]?.filename || null,
    };

    await Driver.create(data);

    res.json({
      success: true,
      message: "Driver created successfully"
    });

  } catch (err) {
    console.error('createDriver error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= GET ALL DRIVERS =================
exports.getDrivers = async (req, res) => {
  try {
    const data = await Driver.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ================= DELETE DRIVER =================
exports.deleteDriver = async (req, res) => {
  try {
    await Driver.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
