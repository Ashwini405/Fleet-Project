const express = require('express');
const router = express.Router();
const controller = require('../controllers/supervisorController');
const upload = require('../config/multer');

const supervisorUpload = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'id_document',   maxCount: 1 },
  { name: 'bank_document', maxCount: 1 },
]);

router.post('/', supervisorUpload, controller.createSupervisor);
router.get('/', controller.getSupervisors);
router.delete('/:id', controller.deleteSupervisor);

module.exports = router;