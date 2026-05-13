const express = require('express');

const router = express.Router();

const upload = require('../config/multer');
const {

  getIncidentVehicles,

  createIncident,

  getIncidents,

  getIncidentById,

  updateIncidentStatus,

  uploadIncidentFile,

  deleteIncident

} = require('../controllers/incidentController');


// ======================================================
// GET VEHICLES FOR INCIDENT DROPDOWN
// ======================================================

router.get(
  '/vehicles',
  getIncidentVehicles
);


// ======================================================
// UPLOAD INCIDENT FILE
// ======================================================

router.post(
  '/upload',
  upload.single('file'),
  uploadIncidentFile
);


// ======================================================
// CREATE INCIDENT
// ======================================================

router.post(
  '/',
  createIncident
);


// ======================================================
// GET ALL INCIDENTS
// ======================================================

router.get(
  '/',
  getIncidents
);


// ======================================================
// GET INCIDENT BY ID
// ======================================================

router.get(
  '/:id',
  getIncidentById
);


// ======================================================
// DELETE INCIDENT
// ======================================================

router.delete(
  '/:id',
  deleteIncident
);

router.put(
  '/:id/status',
  updateIncidentStatus
);


module.exports = router;