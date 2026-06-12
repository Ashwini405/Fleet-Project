const ShowroomLedger =
require("../models/showroomLedgerModel");

exports.getShowroomLedger =
async (req, res) => {

  try {

    const showroomId =
      req.params.id;

    const data =
      await ShowroomLedger
        .getLedgerByShowroomId(
          showroomId
        );

    if (!data) {

      return res.status(404).json({
        success: false,
        message: "Showroom not found"
      });

    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    console.error(
      "SHOWROOM LEDGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};