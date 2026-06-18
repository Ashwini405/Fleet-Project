const PartsVendorLedger =
require("../models/partsVendorLedgerModel");

exports.getPartsVendorLedger =
async (req, res) => {

  try {

    const data =
      await PartsVendorLedger
        .getLedger(
          req.params.id
        );

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};