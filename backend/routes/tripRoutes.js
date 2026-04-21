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
  getFuel,
  updateTripStatus,
  getTripsByVehicle
} = require('../controllers/tripController');

// 🔥 FIX: MOVE THIS TO TOP
router.get('/by-vehicle/:vehicleId', getTripsByVehicle);

// ✅ MAIN TRIP ROUTES
router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

// 🔥 STATUS UPDATE ROUTE
router.put('/:id/status', updateTripStatus);

// 🔥 EXPENSE ROUTES
router.post('/:tripId/expense', addExpense);
router.get('/:tripId/expense', getExpenses);

// 🔥 FUEL ROUTES
router.post('/:tripId/fuel', addFuel);
router.get('/:tripId/fuel', getFuel);

module.exports = router;