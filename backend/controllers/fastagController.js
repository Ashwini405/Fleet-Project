const Fastag = require("../models/fastagModel");
const db = require("../config/db");
const { logAudit } = require("../middleware/auditMiddleware");

// ==========================================================
// Fires a low-balance notification if the account has dropped
// below its threshold and one hasn't already been sent today.
// ==========================================================
async function checkLowBalance(account, vehicleNo) {
  const balance = Number(account.balance);
  const threshold = Number(account.low_balance_threshold || 200);

  if (balance >= threshold) return;

  const [existing] = await db.query(
    `SELECT id FROM fastag_notifications
     WHERE fastag_account_id = ? AND DATE(created_at) = CURDATE()`,
    [account.id]
  );
  if (existing.length > 0) return;

  const severity = balance <= 0 ? "Critical" : "High";
  const title = balance <= 0
    ? `Fastag Balance Exhausted — ${vehicleNo || account.fastag_id || "Unknown Vehicle"}`
    : `Fastag Low Balance — ${vehicleNo || account.fastag_id || "Unknown Vehicle"}`;
  const message = `Fastag balance for ${vehicleNo || "vehicle"} is ₹${balance.toFixed(2)}, below the threshold of ₹${threshold.toFixed(2)}.`;

  await db.query(
    `INSERT INTO fastag_notifications
      (fastag_account_id, vehicle_no, title, message, severity)
     VALUES (?, ?, ?, ?, ?)`,
    [account.id, vehicleNo || null, title, message, severity]
  );
}

// ========================================
// ACCOUNTS
// ========================================
exports.getAllAccounts = async (req, res) => {
  try {
    const data = await Fastag.getAllAccounts();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET FASTAG ACCOUNTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { vehicle_id, fastag_id } = req.body;
    if (!vehicle_id) {
      return res.status(400).json({ success: false, message: "Vehicle is required" });
    }

    const existing = await Fastag.getAccountByVehicle(vehicle_id);
    if (existing) {
      return res.status(400).json({ success: false, message: "This vehicle already has a Fastag account" });
    }

    const result = await Fastag.createAccount(req.body);

    await logAudit(req, {
      module_name: "Fastag",
      action: "CREATE",
      description: `Created Fastag account (${fastag_id || "no ID"}) for vehicle #${vehicle_id}.`,
      new_data: req.body,
    });

    res.status(201).json({ success: true, message: "Fastag account created", data: { id: result.insertId } });
  } catch (error) {
    console.error("CREATE FASTAG ACCOUNT ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await Fastag.getAccountById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: "Fastag account not found" });
    }

    await Fastag.updateAccount(id, req.body);

    await logAudit(req, {
      module_name: "Fastag",
      action: "UPDATE",
      description: `Updated Fastag account #${id}.`,
      old_data: before,
      new_data: req.body,
    });

    res.json({ success: true, message: "Fastag account updated" });
  } catch (error) {
    console.error("UPDATE FASTAG ACCOUNT ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================================
// TRANSACTIONS
// ========================================
exports.getTransactionsByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const account = await Fastag.getAccountByVehicle(vehicleId);
    if (!account) {
      return res.status(404).json({ success: false, message: "No Fastag account for this vehicle" });
    }

    const data = await Fastag.getTransactionsByAccount(account.id);
    res.json({ success: true, account, count: data.length, data });
  } catch (error) {
    console.error("GET FASTAG TRANSACTIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { vehicleId, type, from, to } = req.query;
    const data = await Fastag.getAllTransactions({ vehicleId, type, from, to });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET ALL FASTAG TRANSACTIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.recharge = async (req, res) => {
  try {
    const { fastag_account_id, amount, date, reference_no, proof_upload, created_by } = req.body;

    if (!fastag_account_id || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Account and a valid amount are required" });
    }

    const account = await Fastag.getAccountById(fastag_account_id);
    if (!account) {
      return res.status(404).json({ success: false, message: "Fastag account not found" });
    }

    const newBalance = Number(account.balance) + Number(amount);
    await Fastag.updateBalance(fastag_account_id, newBalance);

    const result = await Fastag.createTransaction({
      fastag_account_id,
      type: "recharge",
      amount,
      date: date || new Date().toISOString().slice(0, 10),
      balance_after: newBalance,
      reference_no,
      proof_upload,
      created_by,
    });

    await logAudit(req, {
      module_name: "Fastag",
      action: "CREATE",
      description: `Recharged Fastag account #${fastag_account_id} with ₹${amount}. New balance ₹${newBalance}.`,
      new_data: { fastag_account_id, amount, newBalance },
    });

    res.status(201).json({ success: true, message: "Recharge recorded", data: { id: result.insertId, balance: newBalance } });
  } catch (error) {
    console.error("FASTAG RECHARGE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.tollDeduction = async (req, res) => {
  try {
    const { fastag_account_id, amount, date, toll_plaza_name, reference_no, created_by } = req.body;

    if (!fastag_account_id || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Account and a valid amount are required" });
    }

    const account = await Fastag.getAccountById(fastag_account_id);
    if (!account) {
      return res.status(404).json({ success: false, message: "Fastag account not found" });
    }

    const newBalance = Number(account.balance) - Number(amount);
    await Fastag.updateBalance(fastag_account_id, newBalance);

    const result = await Fastag.createTransaction({
      fastag_account_id,
      type: "toll_deduction",
      amount,
      date: date || new Date().toISOString().slice(0, 10),
      toll_plaza_name,
      balance_after: newBalance,
      reference_no,
      created_by,
    });

    await logAudit(req, {
      module_name: "Fastag",
      action: "CREATE",
      description: `Toll deduction of ₹${amount} on Fastag account #${fastag_account_id}${toll_plaza_name ? ` at ${toll_plaza_name}` : ""}. New balance ₹${newBalance}.`,
      new_data: { fastag_account_id, amount, toll_plaza_name, newBalance },
    });

    const updatedAccount = await Fastag.getAccountById(fastag_account_id);
    await checkLowBalance(updatedAccount, updatedAccount.vehicle_no);

    res.status(201).json({ success: true, message: "Toll deduction recorded", data: { id: result.insertId, balance: newBalance } });
  } catch (error) {
    console.error("FASTAG TOLL DEDUCTION ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
