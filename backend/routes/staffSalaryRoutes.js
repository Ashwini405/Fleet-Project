const express = require('express');
const router = express.Router();

const {
  getStaffList,
  getStaffDetails,
  createSalary,
  updateSalary,
  getSalaryById,
  getPendingSalaries,
  getSalaryHistory,
  approveSalary,
  rejectSalary,
  markSalaryPaid,
  duplicateSalary,
  resubmitSalary,
  deleteSalary,
} = require('../controllers/staffSalaryController');

// ====================================
// Staff List & Details
// ====================================
router.get('/staff-list', getStaffList);
router.get('/staff-details/:staffType/:staffId', getStaffDetails);

// ====================================
// Pending & History
// ====================================
router.get('/pending', getPendingSalaries);
router.get('/history', getSalaryHistory);

// ====================================
// CRUD / Actions
// ====================================
router.get('/:id', getSalaryById);
router.post('/', createSalary);
router.put('/:id', updateSalary);
router.put('/approve/:id', approveSalary);
router.put('/reject/:id', rejectSalary);
router.put('/resubmit/:id', resubmitSalary);
router.put('/paid/:id', markSalaryPaid);
router.post('/duplicate/:id', duplicateSalary);
router.delete('/:id', deleteSalary);

module.exports = router;
