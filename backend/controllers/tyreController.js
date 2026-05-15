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


module.exports = {

  createTyre,

  getAllTyres

};