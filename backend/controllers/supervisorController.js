const Supervisor = require('../models/supervisorModel');
const wallet = require('../services/supervisorWalletService');

// CREATE
exports.createSupervisor = async (req, res) => {
  try {
    const data = {
      ...req.body,
      profile_photo: req.files?.profile_photo?.[0]?.filename || null,
      id_document:   req.files?.id_document?.[0]?.filename   || null,
      bank_document: req.files?.bank_document?.[0]?.filename || null,
    };
    const created = await Supervisor.create(data);
    // The wallet statement starts with the balance entered on this form.
    await wallet.recordOpening(created.insertId, Number(data.wallet_balance) || 0, req.user?.username);
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

// UPDATE
exports.updateSupervisor = async (req, res) => {
  try {
    const data = {
      ...req.body,
      profile_photo: req.files?.profile_photo?.[0]?.filename || null,
      id_document:   req.files?.id_document?.[0]?.filename   || null,
      bank_document: req.files?.bank_document?.[0]?.filename || null,
    };
    await Supervisor.update(req.params.id, data);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Update failed' });
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