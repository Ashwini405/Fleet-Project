const VendorPayment =
require("../models/vendorPaymentModel");

// ======================================
// GET PAYMENTS
// ======================================

exports.getVendorPayments =
async (req, res) => {

  try {

    const vendorId =
      req.params.vendorId;

    const payments =
      await VendorPayment.getByVendorId(
        vendorId
      );

    res.status(200).json({
      success: true,
      data: payments
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ======================================
// CREATE PAYMENT
// ======================================

exports.createPayment =
async (req, res) => {

  try {

    console.log("PAYMENT BODY:", req.body);

    const result =
      await VendorPayment.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      insertId: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};