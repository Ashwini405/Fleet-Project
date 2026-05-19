const express = require('express');

const router = express.Router();

const upload = require('../config/multer');
const tyreController = require('../controllers/tyreController');

const {

  createTyre,

  getAllTyres,

  getInStockTyres,

  mountTyre

} = require('../controllers/tyreController');


// ======================================================
// CREATE TYRE
// ======================================================

router.post(

  '/',

  upload.array(

    'tyre_files',

    20

  ),

  createTyre

);


// ======================================================
// GET ALL TYRES
// ======================================================

router.get(

  '/',

  getAllTyres

);


// ======================================================
// GET IN STOCK TYRES
// ======================================================

router.get(

  '/in-stock',

  getInStockTyres

);


// ======================================================
// MOUNT TYRE
// ======================================================

router.put(

  '/mount',

  mountTyre

);
router.get(
  '/vehicle/:vehicleId',
  tyreController.getTyresByVehicle
);

module.exports = router;