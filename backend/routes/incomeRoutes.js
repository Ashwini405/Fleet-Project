const express = require('express');

const router = express.Router();

const incomeController =
require('../controllers/incomeController');
const { protect } = require('../middleware/permissionMiddleware');

// =====================================================
// CREATE INCOME
// =====================================================

router.post(
  '/',
  ...protect('Income & Expense', 'create'),
  incomeController.createIncome
);

// =====================================================
// UPDATE INCOME
// =====================================================

router.put(
  '/:id',
  ...protect('Income & Expense', 'edit'),
  incomeController.updateIncome
);

// =====================================================
// GET ALL INCOME
// =====================================================

router.get(
  '/',
  ...protect('Income & Expense', 'view'),
  incomeController.getAllIncome
);

// =====================================================
// GET INCOME BY TRIP
// =====================================================

router.get(
  '/trip/:tripId',
  ...protect('Income & Expense', 'view'),
  incomeController.getIncomeByTrip
);

// =====================================================
// GET COMPLETED TRIPS BY VEHICLE
// =====================================================

router.get(
  '/vehicle-trips/:vehicleId',
  ...protect('Income & Expense', 'view'),
  incomeController.getCompletedTripsByVehicle
);

// =====================================================
// GET SINGLE INCOME
// =====================================================

router.get(
  '/:id',
  ...protect('Income & Expense', 'view'),
  incomeController.getIncomeById
);

module.exports = router;