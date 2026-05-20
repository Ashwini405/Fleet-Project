const express = require('express');
const router = express.Router();
const {
  createBattery, getAllBatteries, getAvailableBatteries, getBatteryById,
  installBattery, replaceBattery, getVehicleActiveBattery, getVehicleBatteryHistory,
  getBatteryHistory, getDashboardStats, updateBattery, getAnalytics
} = require('../controllers/batteryController');

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/available', getAvailableBatteries);
router.get('/vehicle/:vehicleId/active', getVehicleActiveBattery);
router.get('/vehicle/:vehicleId/history', getVehicleBatteryHistory);
router.get('/history/:batteryId', getBatteryHistory);
router.get('/:id', getBatteryById);
router.get('/', getAllBatteries);
router.post('/', createBattery);
router.put('/:id', updateBattery);
router.post('/install', installBattery);
router.post('/replace', replaceBattery);

module.exports = router;
