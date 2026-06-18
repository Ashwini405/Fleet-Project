const tyreLedgerModel = require("../models/tyreLedgerModel");

const getTyreLedger = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const data = await tyreLedgerModel.getVendorLedger(vendorId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      vendor: data.vendor,
      transactions: data.transactions,
    });
  } catch (error) {
    console.error("Tyre Ledger Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTyreLedger,
};