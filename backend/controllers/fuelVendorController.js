const FuelVendor =
require("../models/fuelVendorModel");

// GET ALL
exports.getAllFuelVendors =
async (req, res) => {

  try {

    const data =
      await FuelVendor.getAll();

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
exports.getFuelVendorById =
async (req, res) => {

  try {

    const data =
      await FuelVendor.getById(
        req.params.id
      );

    if (!data) {

      return res.status(404).json({
        success: false,
        message:
          "Fuel Vendor not found"
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
exports.createFuelVendor =
async (req, res) => {

  try {

    const result =
      await FuelVendor.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Fuel Vendor Created Successfully",
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
exports.updateFuelVendor =
async (req, res) => {

  try {

    await FuelVendor.update(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message:
        "Fuel Vendor Updated Successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};