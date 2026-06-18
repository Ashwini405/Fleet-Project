const PartsVendor =
require("../models/partsVendorModel");

exports.getAllPartsVendors =
async (req, res) => {

  try {

    const data =
      await PartsVendor.getAll();

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getPartsVendorById =
async (req, res) => {

  try {

    const data =
      await PartsVendor.getById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.createPartsVendor =
async (req, res) => {

  try {

    const result =
      await PartsVendor.create(
        req.body
      );

    res.status(201).json({
      success: true,
      insertId:
        result.insertId
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.updatePartsVendor =
async (req, res) => {

  try {

    await PartsVendor.update(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};