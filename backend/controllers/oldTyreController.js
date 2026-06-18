const OldTyreModel = require('../models/oldTyreModel');


// ======================================================
// CREATE OLD TYRE
// ======================================================

const createOldTyre = async (req, res) => {

  try {

    const result = await OldTyreModel.createOldTyre(

      req.body

    );

    res.status(201).json({

      success: true,

      message: 'Old Tyre Added Successfully',

      data: {

        id: result.insertId

      }

    });

  } catch (error) {

    console.error(

      'CREATE OLD TYRE ERROR:',
      error

    );

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};


// ======================================================
// GET ALL OLD TYRES
// ======================================================

const getAllOldTyres = async (req, res) => {

  try {

    const tyres =

      await OldTyreModel.getAllOldTyres();

    res.status(200).json({

      success: true,

      count: tyres.length,

      data: tyres

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};

// ======================================================
// UPDATE OLD TYRE STATUS
// ======================================================

const updateOldTyreStatus = async (req, res) => {

  try {

    const { tyreNo } = req.params;

    const {
      tyre_status,
      store_location
    } = req.body;

    await OldTyreModel.updateOldTyreStatus(
      tyreNo,
      tyre_status,
      store_location
    );

    res.status(200).json({
      success: true,
      message: 'Old tyre updated successfully'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });

  }

};

module.exports = {

  createOldTyre,

  getAllOldTyres,
  updateOldTyreStatus

};