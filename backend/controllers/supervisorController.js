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

exports.getSupervisorLedger = async (req, res) => {
  try {
    const data = await Supervisor.getLedger(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Supervisor not found.' });
    }
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getSupervisorLedger error:', err);
    return res.status(500).json({ success: false, message: 'Could not load supervisor ledger.' });
  }
};

exports.addSupervisorWalletCredit = async (req, res) => {
  try {
    const body = req.body || {};
    const amount = Number(body.amount);
    const supervisorId = Number(req.params.id);

    if (!Number.isInteger(supervisorId) || supervisorId <= 0 ||
        !Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid positive wallet amount.',
      });
    }

    const result = await Supervisor.addWalletCredit(supervisorId, amount);

    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }

    return res.status(201).json({ success: true, message: 'Wallet balance added successfully.' });
  } catch (err) {
    console.error('addSupervisorWalletCredit error:', err);
    return res.status(500).json({ success: false, message: 'Could not add to supervisor wallet.' });
  }
};

exports.createSupervisorLedgerExpense = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const vehicleId = Number(req.body.vehicle_id);
    const { expense_date, payment_method, description } = req.body;

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(vehicleId) || vehicleId <= 0 || !expense_date || !payment_method || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, date, payment method, description, and a valid positive amount are required.',
      });
    }

    const result = await Supervisor.createLedgerExpense(req.params.id, {
      amount,
      vehicle_id: vehicleId,
      expense_date,
      payment_method,
      vendor_payee: req.body.vendor_payee?.trim(),
      description: description.trim(),
    });

    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return res.status(201).json({ success: true, message: 'Expense recorded and wallet balance updated.' });
  } catch (err) {
    console.error('createSupervisorLedgerExpense error:', err);
    return res.status(500).json({ success: false, message: 'Could not record supervisor expense.' });
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