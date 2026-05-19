const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  createTyre,
  getAllTyres,
  getInStockTyres,
  mountTyre,
  getTyresByVehicle,
  getMountedTyresByVehicle,
  getAvailableReplacementTyres,
  processTyreService,
  getTyreServiceHistory,
} = require('../controllers/tyreController');

router.post('/', upload.array('tyre_files', 20), createTyre);
router.get('/', getAllTyres);
router.get('/in-stock', getInStockTyres);
router.put('/mount', mountTyre);
router.get('/vehicle/:vehicleId', getTyresByVehicle);
router.get('/mounted/:vehicleId', getMountedTyresByVehicle);
router.get('/available-replacements', getAvailableReplacementTyres);
router.post('/service', processTyreService);
router.get('/history/:tyreNumber', getTyreServiceHistory);

module.exports = router;
