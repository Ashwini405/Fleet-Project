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

module.exports = {
  getLabourLedger,
};
