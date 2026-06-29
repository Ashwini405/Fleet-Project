const db = require('../config/database');
const driverSettlementModel = require('../models/driverSettlementModel');

// Get all plants
exports.getPlants = async (req, res) => {
  try {
    const data = await driverSettlementModel.getPlants();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get vehicles by plant
exports.getVehicles = async (req, res) => {
  try {
    const { plant } = req.params;
    const data = await driverSettlementModel.getVehiclesByPlant(plant);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get driver details by vehicle
exports.getDriverDetails = async (req, res) => {
  try {
    const { vehicleNo } = req.params;
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month parameter is required' 
      });
    }

    const data = await driverSettlementModel.getDriverByVehicle(vehicleNo, month);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending settlements
exports.getPendingList = async (req, res) => {
  try {
    const data = await driverSettlementModel.getPendingSettlements();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pending list:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get settlement history
exports.getHistoryList = async (req, res) => {
  try {
    const data = await driverSettlementModel.getSettlementHistory();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new settlement
exports.createSettlement = async (req, res) => {
  try {
    const id = await driverSettlementModel.createSettlement(req.body);
    res.json({ 
      success: true, 
      message: 'Settlement created successfully',
      id 
    });
  } catch (error) {
    console.error('Error creating settlement:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Approve settlement
exports.approveSettlement = async (req, res) => {
  try {
    const { id } = req.params;
    await driverSettlementModel.approveSettlement(id);
    res.json({ 
      success: true, 
      message: 'Settlement approved successfully' 
    });
  } catch (error) {
    console.error('Error approving settlement:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Reject settlement
exports.rejectSettlement = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    await driverSettlementModel.rejectSettlement(id, reason);
    res.json({ 
      success: true, 
      message: 'Settlement rejected successfully' 
    });
  } catch (error) {
    console.error('Error rejecting settlement:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Mark as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    await driverSettlementModel.markAsPaid(id, paymentData);
    res.json({ 
      success: true, 
      message: 'Settlement marked as paid successfully' 
    });
  } catch (error) {
    console.error('Error marking as paid:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Resubmit settlement
exports.resubmitSettlement = async (req, res) => {
  try {
    const { id } = req.params;
    await driverSettlementModel.resubmitSettlement(id);
    res.json({ 
      success: true, 
      message: 'Settlement resubmitted successfully' 
    });
  } catch (error) {
    console.error('Error resubmitting settlement:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Duplicate settlement
exports.duplicateSettlement = async (req, res) => {
  try {
    const { id } = req.params;
    const newId = await driverSettlementModel.duplicateSettlement(id);
    res.json({ 
      success: true, 
      message: 'Settlement duplicated successfully',
      id: newId
    });
  } catch (error) {
    console.error('Error duplicating settlement:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};