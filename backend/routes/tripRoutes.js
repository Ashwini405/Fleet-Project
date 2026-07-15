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
const { protect } = require('../middleware/permissionMiddleware');


// 🔥 IMPORTANT: KEEP THIS ABOVE /:id
router.get('/by-vehicle/:vehicleId', ...protect('Trip Master', 'view'), getTripsByVehicle);


// ✅ MAIN TRIP ROUTES
router.route('/')
  .get(...protect('Trip Master', 'view'), getTrips)
  .post(...protect('Trip Master', 'create'), createTrip);


// ✅ SINGLE TRIP ROUTES
router.route('/:id')
  .get(...protect('Trip Master', 'view'), getTripById)
  .put(...protect('Trip Master', 'edit'), updateTrip)
  .delete(...protect('Trip Master', 'delete'), deleteTrip);


// 🔥 STATUS UPDATE
router.put('/:id/status', ...protect('Trip Master', 'edit'), updateTripStatus);


// 🔥 EXPENSE ROUTES
router.post('/:tripId/expense', ...protect('Trip Master', 'edit'), addExpense);
router.get('/:tripId/expense', ...protect('Trip Master', 'view'), getExpenses);


// 🔥 FUEL ROUTES
router.post('/:tripId/fuel', ...protect('Trip Master', 'edit'), addFuel);
router.get('/:tripId/fuel', ...protect('Trip Master', 'view'), getFuel);


// 🔥 DOCUMENT UPLOAD ROUTE (NEW)
router.post('/:tripId/documents', ...protect('Trip Master', 'edit'), upload.single('file'), uploadDocument);


module.exports = router;