const Supervisor = require('../models/supervisorModel');

// CREATE
exports.createSupervisor = async (req, res) => {
  try {
    await Supervisor.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

// GET ALL
exports.getSupervisors = async (req, res) => {
  try {
    const data = await Supervisor.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

// DELETE
exports.deleteSupervisor = async (req, res) => {
  try {
    await Supervisor.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};