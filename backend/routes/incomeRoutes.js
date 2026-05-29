const express = require('express');

const router = express.Router();

const incomeController =
require('../controllers/incomeController');

// =====================================================
// CREATE INCOME
// =====================================================

router.post(
  '/',
  incomeController.createIncome
);

// =====================================================
// GET ALL INCOME
// =====================================================

router.get(
  '/',
  incomeController.getAllIncome
);

// =====================================================
// GET SINGLE INCOME
// =====================================================

router.get(
  '/:id',
  incomeController.getIncomeById
);

// =====================================================
// GET COMPLETED TRIPS BY VEHICLE
// =====================================================

router.get(
  '/vehicle-trips/:vehicleId',
  incomeController.getCompletedTripsByVehicle
);

module.exports = router;