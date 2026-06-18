const TyreVendor =
require("../models/tyreVendorModel");

exports.getAllTyreVendors =
async (req, res) => {

  try {

    const data =
      await TyreVendor.getAll();

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

exports.getTyreVendorById =
async (req, res) => {

  try {

    const data =
      await TyreVendor.getById(
        req.params.id
      );

    if (!data) {

      return res.status(404).json({
        success: false,
        message: "Tyre vendor not found"
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

exports.createTyreVendor =
async (req, res) => {

  try {

    const result =
      await TyreVendor.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Tyre Vendor Created Successfully",
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

exports.updateTyreVendor =
async (req, res) => {

  try {

    await TyreVendor.update(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message:
        "Tyre Vendor Updated Successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};