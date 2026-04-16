const Driver = require('../models/driverModel');

// CREATE DRIVER
exports.createDriver = async (req, res) => {
  try {
    await Driver.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

// GET ALL DRIVERS
exports.getDrivers = async (req, res) => {
  try {
    const data = await Driver.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

// DELETE DRIVER
exports.deleteDriver = async (req, res) => {
  try {
    await Driver.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};