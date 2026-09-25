const StaffSalaryModel = require('../models/staffSalaryModel');

// ======================================
// Get Staff List (Supervisors + Employees)
// ======================================
const getStaffList = async (req, res) => {
  try {
    const staff = await StaffSalaryModel.getStaffList();
    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error('Get Staff List Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Staff Details
// ======================================
const getStaffDetails = async (req, res) => {
  try {
    const { staffType, staffId } = req.params;
    const staff = await StaffSalaryModel.getStaffDetails(staffType, staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }
    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error('Get Staff Details Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create / Save Salary
// ======================================
const createSalary = async (req, res) => {
  try {
    const result = await StaffSalaryModel.createSalary(req.body);
    res.status(201).json({
      success: true,
      message: 'Salary record created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Create Salary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Salary
// ======================================
const updateSalary = async (req, res) => {
  try {
    const result = await StaffSalaryModel.updateSalary(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Salary record updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Update Salary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Salary by ID
// ======================================
const getSalaryById = async (req, res) => {
  try {
    const data = await StaffSalaryModel.getSalaryById(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found',
      });
    }
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Salary By ID Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Pending Salaries
// ======================================
const getPendingSalaries = async (req, res) => {
  try {
    const data = await StaffSalaryModel.getPendingSalaries();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Pending Salaries Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Salary History
// ======================================
const getSalaryHistory = async (req, res) => {
  try {
    const filters = {
      staff_type: req.query.staff_type,
      staff_id: req.query.staff_id,
      status: req.query.status,
      month: req.query.month,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    };
    const data = await StaffSalaryModel.getSalaryHistory(filters);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Salary History Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// Approve Salary
// ======================================
const approveSalary = async (req, res) => {
  try {
    const approvedBy = req.user?.username || req.body.approved_by || 'Admin';
    await StaffSalaryModel.approveSalary(req.params.id, approvedBy);
    res.status(200).json({
      success: true,
      message: 'Salary approved successfully',
    });
  } catch (error) {
    console.error('Approve Salary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Reject Salary
// ======================================
const rejectSalary = async (req, res) => {
  try {
    const { reason } = req.body;
    await StaffSalaryModel.rejectSalary(req.params.id, reason);
    res.status(200).json({
      success: true,
      message: 'Salary rejected successfully',
    });
  } catch (error) {
    console.error('Reject Salary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Mark Salary as Paid
// ======================================
const markSalaryPaid = async (req, res) => {
  try {
    await StaffSalaryModel.markSalaryPaid(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Salary payment recorded successfully',
    });
  } catch (error) {
    console.error('Mark Salary Paid Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Duplicate Salary
// ======================================
const duplicateSalary = async (req, res) => {
  try {
    const result = await StaffSalaryModel.duplicateSalary(req.params.id);
    res.status(201).json({
      success: true,
      message: 'Salary duplicated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Duplicate Salary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Resubmit Salary
// ======================================
const resubmitSalary = async (req, res) => {
  try {
    await StaffSalaryModel.resubmitSalary(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Salary resubmitted for approval',
    });
  } catch (error) {
    console.error('Resubmit Salary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Salary
// ======================================
const deleteSalary = async (req, res) => {
  try {
    await StaffSalaryModel.deleteSalary(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Salary deleted successfully',
    });
  } catch (error) {
    console.error('Delete Salary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
