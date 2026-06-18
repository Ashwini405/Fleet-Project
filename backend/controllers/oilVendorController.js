const OilVendor =
require("../models/oilVendorModel");

// GET ALL
exports.getAllOilVendors =
async (req, res) => {

  try {

    const data =
      await OilVendor.getAll();

    res.status(200).json({
      success: true,
      count: data.length,
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

// GET SINGLE
exports.getOilVendorById =
async (req, res) => {

  try {

    const data =
      await OilVendor.getById(
        req.params.id
      );

    if (!data) {

      return res.status(404).json({
        success: false,
        message:
          "Oil Vendor not found"
      });

    }

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

// CREATE
exports.createOilVendor =
async (req, res) => {

  try {

    const result =
      await OilVendor.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Oil Vendor Created Successfully",
      insertId:
        result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// UPDATE
exports.updateOilVendor =
async (req, res) => {

  try {

    await OilVendor.update(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message:
        "Oil Vendor Updated Successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};