const TyreRetreading =
require("../models/tyreRetreadingModel");

exports.createRetreading =
async (req, res) => {

  try {

    const id =
      await TyreRetreading.create(
        req.body
      );

    res.status(201).json({
      success: true,
      id
    });

  } catch (error) {

    console.error(
      "RETREADING CREATE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.getRetreading =
async (req, res) => {

  try {

    const data =
      await TyreRetreading.getAll();

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    console.error(
      "RETREADING FETCH ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};