const TyreModel = require('../models/tyreModel');


// ======================================================
// CREATE TYRE
// ======================================================

const createTyre = async (req, res) => {

  try {

    const body = req.body;

    // ======================================================
    // FILES
    // ======================================================

    const tyre_files = req.files

      ? JSON.stringify(

          req.files.map(

            file => file.filename

          )

        )

      : JSON.stringify([]);


    const data = {

      ...body,

      tyre_files

    };


    const result =

      await TyreModel.createTyre(data);


    res.status(201).json({

      success: true,

      message: 'Tyre Registered Successfully',

      data: {

        id: result.insertId

      }

    });

  } catch (error) {

    console.error(

      'CREATE TYRE ERROR:',
      error

    );

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};


// ======================================================
// GET ALL TYRES
// ======================================================

const getAllTyres = async (req, res) => {

  try {

    const tyres =

      await TyreModel.getAllTyres();

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
// GET IN STOCK TYRES
// ======================================================

const getInStockTyres = async (req, res) => {

  try {

    const tyres =
      await TyreModel.getInStockTyres();

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
// MOUNT TYRE
// ======================================================

const mountTyre = async (req, res) => {

  try {

    const {

      tyre_number,

      vehicle_id,

      vehicle_number,

      tyre_position,

      fitted_odometer,

      date_of_issue,

      running_km,

      status

    } = req.body;

    await TyreModel.mountTyre({

      tyre_number,

      vehicle_id,

      vehicle_number,

      tyre_position,

      fitted_odometer,

      date_of_issue,

      running_km,

      status

    });

    res.status(200).json({

      success: true,

      message: 'Tyre Mounted Successfully'

    });

  } catch (error) {

    console.error(

      'MOUNT TYRE ERROR:',
      error

    );

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};


const getTyresByVehicle = async (req, res) => {

  try {

    const tyres =
      await TyreModel.getTyresByVehicle(
        req.params.vehicleId
      );

    res.status(200).json({
      success: true,
      data: tyres
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
module.exports = {

  createTyre,

  getAllTyres,

  getInStockTyres,

  mountTyre,
  getTyresByVehicle

};