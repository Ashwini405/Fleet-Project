const BatteryModel = require('../models/batteryModel');

const createBattery = async (req, res) => {
  try {
    const result = await BatteryModel.createBattery(req.body);
    res.status(201).json({ success: true, message: 'Battery added to inventory', data: { id: result.insertId } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ success: false, message: 'Serial number already exists' });
    console.error('CREATE BATTERY:', err);
    res.status(500).json({ success: false, message: err.message || 'Server Error' });
  }
};

const getAllBatteries = async (req, res) => {
  try {
    const data = await BatteryModel.getAllBatteries();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getAvailableBatteries = async (req, res) => {
  try {
    const data = await BatteryModel.getAvailableBatteries();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getBatteryById = async (req, res) => {
  try {
    const data = await BatteryModel.getBatteryById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Battery not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const installBattery = async (req, res) => {
  try {
    await BatteryModel.installBattery(req.body);
    res.json({ success: true, message: 'Battery installed successfully' });
  } catch (err) {
    console.error('INSTALL BATTERY:', err);
    res.status(400).json({ success: false, message: err.message || 'Server Error' });
  }
};

const replaceBattery = async (req, res) => {
  try {
    await BatteryModel.replaceBattery(req.body);
    res.json({ success: true, message: 'Battery replaced successfully' });
  } catch (err) {
    console.error('REPLACE BATTERY:', err);
    res.status(400).json({ success: false, message: err.message || 'Server Error' });
  }
};

const getVehicleActiveBattery = async (req, res) => {
  try {
    const data = await BatteryModel.getVehicleActiveBattery(req.params.vehicleId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getVehicleBatteryHistory = async (req, res) => {
  try {
    const data = await BatteryModel.getVehicleBatteryHistory(req.params.vehicleId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getBatteryHistory = async (req, res) => {
  try {
    const data = await BatteryModel.getBatteryHistory(req.params.batteryId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const data = await BatteryModel.getDashboardStats();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateBattery = async (req, res) => {
  try {
    await BatteryModel.updateBattery(req.params.id, req.body);
    res.json({ success: true, message: 'Battery updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const data = await BatteryModel.getAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createBattery, getAllBatteries, getAvailableBatteries, getBatteryById,
  installBattery, replaceBattery, getVehicleActiveBattery, getVehicleBatteryHistory,
  getBatteryHistory, getDashboardStats, updateBattery, getAnalytics
};
