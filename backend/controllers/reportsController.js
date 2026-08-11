const truckPLModel = require("../models/truckPLModel");

// ========================================
// Fleet Reports Summary (KPIs, expense breakdown, top profit/loss)
// ========================================
const getReportsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await truckPLModel.getFleetSummary(
      startDate || null,
      endDate || null
    );

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error("Error in getReportsSummary:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getReportsSummary
};
