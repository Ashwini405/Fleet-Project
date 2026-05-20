const lifecycle = require('../services/maintenanceLifecycleService');

const getMaintenanceAlerts = async (req, res) => {
  try {
    const alerts = await lifecycle.getDashboardAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('GET DASHBOARD ALERTS ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getMaintenanceAlerts,
};
