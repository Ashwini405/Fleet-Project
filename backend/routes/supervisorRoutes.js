const express = require('express');
const router = express.Router();
const controller = require('../controllers/supervisorController');

// Routes
router.post('/', controller.createSupervisor);
router.get('/', controller.getSupervisors);
router.delete('/:id', controller.deleteSupervisor);

module.exports = router;