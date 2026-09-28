const labourLedgerModel = require("../models/labourLedgerModel");

const getLabourLedger = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const data = await labourLedgerModel.getVendorLedger(vendorId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      vendor: data.vendor,
      transactions: data.transactions,
    });
  } catch (error) {
    console.error("Labour Ledger Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addLabourCharge = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { charge_date, amount, work_type } = req.body;

    if (!charge_date) {
      return res.status(400).json({ success: false, message: "Charge date is required" });
    }
    if (!(Number(amount) > 0)) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }
    if (!work_type || !String(work_type).trim()) {
      return res.status(400).json({ success: false, message: "Work type is required" });
    }

    const result = await labourLedgerModel.addCharge(vendorId, req.body);

    res.status(201).json({
      success: true,
      message: "Labour charge recorded",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Add Labour Charge Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLabourCharge = async (req, res) => {
  try {
    const result = await labourLedgerModel.deleteCharge(req.params.chargeId);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Labour charge not found" });
    }

    res.status(200).json({ success: true, message: "Labour charge deleted" });
  } catch (error) {
    console.error("Delete Labour Charge Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLabourLedger,
  addLabourCharge,
  deleteLabourCharge,
};
