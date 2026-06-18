const TyreScrap = require('../models/tyreScrapModel');
const db = require('../config/db');


// ======================================================
// CREATE SCRAP RECORD
// ======================================================

const createScrapRecord = async (req, res) => {

  try {

    await TyreScrap.create(req.body);

    await db.query(
      `
      UPDATE old_tyres
      SET
        tyre_status = 'SCRAPPED',
        store_location = 'Scrap Yard'
      WHERE old_tyre_number = ?
      `,
      [req.body.tyre_no]
    );

    res.status(201).json({
      success: true,
      message: 'Tyre scrapped successfully'
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
// GET ALL SCRAP RECORDS
// ======================================================

const getAllScrapRecords = async (req, res) => {

  try {

    const records = await TyreScrap.getAll();

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
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
  createScrapRecord,
  getAllScrapRecords
};