const rtaVendorModel = require("../models/rtaVendorModel");

const getAllVendors = async (req, res) => {
  try {
    const vendors =
      await rtaVendorModel.getAllVendors();

    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor =
      await rtaVendorModel.getVendorById(
        req.params.id
      );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createVendor = async (req, res) => {
  try {
    const duplicate =
      await rtaVendorModel.checkDuplicateMobile(
        req.body.mobile_number
      );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message:
          "Vendor already exists with this mobile number",
      });
    }

    const id =
      await rtaVendorModel.createVendor(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "RTA Vendor created successfully",
      id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVendor = async (req, res) => {
  try {
    await rtaVendorModel.updateVendor(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message:
        "Vendor updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVendor = async (req, res) => {
  try {
    await rtaVendorModel.deleteVendor(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Vendor deleted successfully",
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
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};