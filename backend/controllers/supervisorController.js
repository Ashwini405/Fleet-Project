const Supervisor = require('../models/supervisorModel');

// CREATE
exports.createSupervisor = async (req, res) => {
  try {
    const data = {
      ...req.body,
      profile_photo: req.files?.profile_photo?.[0]?.filename || null,
      id_document:   req.files?.id_document?.[0]?.filename   || null,
      bank_document: req.files?.bank_document?.[0]?.filename || null,
    };
    await Supervisor.create(data);
    res.json({ success: true });
  } catch (err) {
    console.error('createSupervisor error:', err);
    res.json({ success: false, message: err.message || 'Insert failed' });
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