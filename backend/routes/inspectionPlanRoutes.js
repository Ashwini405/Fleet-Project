const express = require('express');

const router = express.Router();

const {

  createInspectionPlan,

  getInspectionPlans,

  getInspectionPlanById,

  updateInspectionPlan

} = require('../controllers/inspectionPlanController');


// ======================================================
// CREATE PLAN
// ======================================================

router.post(

  '/',

  createInspectionPlan

);


// ======================================================
// UPDATE PLAN
// ======================================================

router.put(

  '/:id',

  updateInspectionPlan

);


// ======================================================
// GET ALL PLANS
// ======================================================

router.get(

  '/',

  getInspectionPlans

);


// ======================================================
// GET PLAN BY ID
// ======================================================

router.get(

  '/:id',

  getInspectionPlanById

);


module.exports = router;