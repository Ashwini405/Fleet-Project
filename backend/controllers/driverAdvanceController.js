const DriverAdvance = require('../models/driverAdvanceModel');

// ================= CREATE ADVANCE =================
exports.createAdvance = async (req, res) => {
  try {
    const { amount, advance_date, reason } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid advance amount is required'
      });
    }

    await DriverAdvance.create({
      driver_id: req.params.id,
      amount,
      advance_date: advance_date || new Date().toISOString().slice(0, 10),
      reason
    });

    res.json({
      success: true,
      message: 'Advance recorded successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= GET ADVANCES FOR A DRIVER =================
exports.getDriverAdvances = async (req, res) => {
  try {
    const data = await DriverAdvance.getByDriver(req.params.id);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= DELETE ADVANCE =================
exports.deleteAdvance = async (req, res) => {
  try {
    await DriverAdvance.delete(req.params.advanceId);

    res.json({
      success: true,
      message: 'Advance removed successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
