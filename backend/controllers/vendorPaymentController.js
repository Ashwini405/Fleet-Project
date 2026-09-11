const VendorPayment =
require("../models/vendorPaymentModel");
const TyreVendor =
require("../models/tyreVendorModel");
const Tyre =
require("../models/tyreModel");

// ======================================
// GET PAYMENTS
// ======================================

exports.getVendorPayments =
async (req, res) => {

  try {

    const vendorId =
      req.params.vendorId;

    const vendorCategory =
      req.query.category;

    const payments =
      await VendorPayment.getByVendorId(
        vendorId,
        vendorCategory
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

    if (req.file) {
      req.body.receipt_files = JSON.stringify([req.file.filename]);
    }

    const result =
      await VendorPayment.create(
        req.body
      );

    // Tyres purchases are tracked per-tyre — allocate this payment against
    // the vendor's oldest outstanding purchases so each tyre's own payment
    // status stays accurate (used to show Paid/Unpaid in the ledger detail view).
    if (req.body.vendor_category === 'tyres' && req.body.vendor_id) {
      const vendor = await TyreVendor.getById(req.body.vendor_id);
      if (vendor) {
        await Tyre.allocatePayment(vendor.vendor_name, req.body.amount);
      }
    }

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