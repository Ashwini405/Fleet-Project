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

// DELETE
exports.deleteStation = async (req, res) => {
  await Station.delete(req.params.id);
  res.json({ success: true });
};

// UPDATE
exports.updateStation = async (req, res) => {
  await Station.update(req.params.id, req.body);
  res.json({ success: true });
};