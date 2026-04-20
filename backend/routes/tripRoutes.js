const express = require('express');
const router = express.Router();

const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addExpense,
  addFuel,
  getExpenses,
  getFuel
} = require('../controllers/tripController');

// ✅ MAIN TRIP ROUTES
router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

// 🔥 EXPENSE ROUTES
router.post('/:tripId/expense', addExpense);
router.get('/:tripId/expense', getExpenses);

// 🔥 FUEL ROUTES
router.post('/:tripId/fuel', addFuel);
router.get('/:tripId/fuel', getFuel);

module.exports = router;