const rtaPaymentModel =
require("../models/rtaPaymentModel");

const createPayment = async (req, res) => {
  try {
    const receipt_document = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.receipt_document || req.body.document || null);

    await rtaPaymentModel.createPayment({
      ...req.body,
      receipt_document,
    });

    res.status(201).json({
      success: true,
      message: "Payment added successfully",
      receipt_document,
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