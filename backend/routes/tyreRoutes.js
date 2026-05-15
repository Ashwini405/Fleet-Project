const express = require('express');

const router = express.Router();

const upload = require('../config/multer');

const {

  createTyre,

  getAllTyres

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


module.exports = router;