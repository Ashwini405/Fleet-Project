const Showroom =
require("../models/showroomModel");

// GET ALL SHOWROOMS
exports.getAllShowrooms =
async (req, res) => {

  try {

    const data =
      await Showroom.getAll();

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

// GET SINGLE SHOWROOM
exports.getShowroomById =
async (req, res) => {

  try {

    const showroom =
      await Showroom.getById(
        req.params.id
      );

    if (!showroom) {
      return res.status(404).json({
        success: false,
        message: "Showroom not found"
      });
    }

    res.status(200).json({
      success: true,
      data: showroom
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// UPDATE SHOWROOM
exports.updateShowroom =
async (req, res) => {

  try {

    await Showroom.update(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Showroom updated successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// CREATE SHOWROOM
exports.createShowroom =
async (req, res) => {

  try {

    const result =
      await Showroom.create(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Showroom created successfully",
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