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
// GET ALL INCOME
// =====================================================

router.get(
  '/',
  ...protect('Income & Expense', 'view'),
  incomeController.getAllIncome
);

// =====================================================
// GET SINGLE INCOME
// =====================================================

router.get(
  '/:id',
  ...protect('Income & Expense', 'view'),
  incomeController.getIncomeById
);

// =====================================================
// GET COMPLETED TRIPS BY VEHICLE
// =====================================================

router.get(
  '/vehicle-trips/:vehicleId',
  ...protect('Income & Expense', 'view'),
  incomeController.getCompletedTripsByVehicle
);

module.exports = router;