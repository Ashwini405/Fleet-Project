const Station = require('../models/stationModel');

// Create station
exports.createStation = async (req, res) => {
  try {
    const result = await Station.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

// Get all stations
exports.getStations = async (req, res) => {
  try {
    const data = await Station.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

// Get vehicles assigned to a station
exports.getStationVehicles = async (req, res) => {
  try {
    const data = await Station.getVehicles(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch station vehicles' });
  }
};

// DELETE
exports.deleteStation = async (req, res) => {
  try {
    const dependents = await Station.getDependents(req.params.id);

    const blockers = [];
    if (dependents.supervisors.length) blockers.push(`Supervisor(s): ${dependents.supervisors.join(', ')}`);
    if (dependents.drivers.length) blockers.push(`Driver(s): ${dependents.drivers.join(', ')}`);
    if (dependents.vehicles.length) blockers.push(`Vehicle(s): ${dependents.vehicles.join(', ')}`);
    if (dependents.trips.length) blockers.push(`Trip(s): ${dependents.trips.join(', ')}`);

    if (blockers.length) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete — this station is still assigned to: ${blockers.join(' | ')}. Reassign or remove them first.`,
        dependents
      });
    }

    await Station.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({
        success: false,
        message: 'This station is still linked to drivers, supervisors, vehicles, or trips and cannot be deleted.'
      });
    }
    res.status(500).json({ success: false, message: 'Failed to delete station' });
  }
};

// UPDATE
exports.updateStation = async (req, res) => {
  try {
    await Station.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update station' });
  }
};