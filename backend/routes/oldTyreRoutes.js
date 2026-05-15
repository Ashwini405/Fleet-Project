const express = require('express');

const router = express.Router();

const {

  createOldTyre,

  getAllOldTyres

} = require('../controllers/oldTyreController');


// ======================================================
// CREATE OLD TYRE
// ======================================================

router.post(

  '/',

  createOldTyre

);


// ======================================================
// GET ALL OLD TYRES
// ======================================================

router.get(

  '/',

  getAllOldTyres

);


module.exports = router;