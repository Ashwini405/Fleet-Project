const express = require('express');
const router = express.Router();

// 🔥 CONTROLLERS
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
  getTripsByVehicle,
  uploadDocument   // ✅ NEW
} = require('../controllers/tripController');

// 🔥 MULTER
const upload = require('../config/multer');


// 🔥 IMPORTANT: KEEP THIS ABOVE /:id
router.get('/by-vehicle/:vehicleId', getTripsByVehicle);


// ✅ MAIN TRIP ROUTES
router.route('/')
  .get(getTrips)
  .post(createTrip);


// ✅ SINGLE TRIP ROUTES
router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);


// 🔥 STATUS UPDATE
router.put('/:id/status', updateTripStatus);


// 🔥 EXPENSE ROUTES
router.post('/:tripId/expense', addExpense);
router.get('/:tripId/expense', getExpenses);


// 🔥 FUEL ROUTES
router.post('/:tripId/fuel', addFuel);
router.get('/:tripId/fuel', getFuel);


// 🔥 DOCUMENT UPLOAD ROUTE (NEW)
router.post('/:tripId/documents', upload.single('file'), uploadDocument);


module.exports = router;