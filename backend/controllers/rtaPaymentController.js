const rtaPaymentModel =
require("../models/rtaPaymentModel");

const createPayment = async (req, res) => {
  try {
    await rtaPaymentModel.createPayment(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Payment added successfully",
    });

  } catch (error) {
    console.error(
      "Create Payment Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVendorPayments = async (
  req,
  res
) => {
  try {
    const payments =
      await rtaPaymentModel.getPaymentsByVendor(
        req.params.vendorId
      );

    res.status(200).json({
      success: true,
      data: payments,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getVendorPayments,
};