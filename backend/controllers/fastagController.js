const Fastag = require("../models/fastagModel");
const { logAudit } = require("../middleware/auditMiddleware");

const MAX_UPLOAD_ROWS = 5000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ========================================
// ACCOUNTS (vehicle ↔ FASTag tag mapping)
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

    await Fastag.updateAccount(id, { ...before, ...req.body });

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

// Legacy wallet transactions for a vehicle (still read by Fuel / Vehicle pages)
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

// ========================================
// FASTAG EXPENSES
// ========================================
const clean = (value) => String(value ?? "").trim();
const normalizeKey = (value) => clean(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
const duplicateKey = (vehicleId, date, amount, plaza) =>
  `${vehicleId}|${date}|${Number(amount).toFixed(2)}|${normalizeKey(plaza)}`;

const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

// Resolves each raw row to a vehicle (by vehicle number or tag id),
// validates it, flags duplicates and attaches the trip/driver for that date.
async function prepareRows(rawRows) {
  const lookup = await Fastag.getVehicleLookup();
  const byVehicleNo = new Map();
  const byTag = new Map();
  lookup.forEach(vehicle => {
    byVehicleNo.set(normalizeKey(vehicle.vehicle_no), vehicle);
    [vehicle.vehicle_fastag_id, vehicle.account_fastag_id].forEach(tag => {
      if (!clean(tag)) return;
      const key = normalizeKey(tag);
      const matches = byTag.get(key) || [];
      if (!matches.some(match => match.vehicle_id === vehicle.vehicle_id)) matches.push(vehicle);
      byTag.set(key, matches);
    });
  });

  const today = todayISO();
  const rows = rawRows.map((raw, index) => {
    const row = {
      row_no: raw.row_no || index + 1,
      vehicle_no_input: clean(raw.vehicle_no),
      tag_id: clean(raw.tag_id),
      date: clean(raw.date),
      amount: Number(String(raw.amount ?? "").replace(/[^0-9.-]/g, "")),
      toll_plaza: clean(raw.toll_plaza).slice(0, 255),
      transaction_id: clean(raw.transaction_id).slice(0, 255),
      description: clean(raw.description),
      errors: [],
    };

    const vehicleByNo = row.vehicle_no_input ? byVehicleNo.get(normalizeKey(row.vehicle_no_input)) : null;
    const tagMatches = row.tag_id ? byTag.get(normalizeKey(row.tag_id)) || [] : [];
    // A tag entered on several vehicles can't identify the truck on its own.
    const vehicleByTag = tagMatches.length === 1 ? tagMatches[0] : null;
    const vehicle = vehicleByNo || vehicleByTag;

    if (!row.vehicle_no_input && !row.tag_id) {
      row.errors.push("Vehicle number or Tag ID is required");
    } else if (!vehicleByNo && tagMatches.length > 1) {
      row.errors.push(`Tag ID ${row.tag_id} is linked to ${tagMatches.length} vehicles (${tagMatches.map(m => m.vehicle_no).join(", ")}); add the vehicle number`);
    } else if (!vehicle) {
      row.errors.push(row.vehicle_no_input
        ? `Vehicle ${row.vehicle_no_input} not found in fleet`
        : `Tag ID ${row.tag_id} is not linked to any vehicle`);
    } else if (vehicleByNo && tagMatches.length && !tagMatches.some(m => m.vehicle_id === vehicleByNo.vehicle_id)) {
      row.errors.push(`Tag ID ${row.tag_id} belongs to ${tagMatches.map(m => m.vehicle_no).join(", ")}, not ${vehicleByNo.vehicle_no}`);
    }

    if (!DATE_RE.test(row.date) || Number.isNaN(new Date(row.date).getTime())) {
      row.errors.push("Invalid date (use YYYY-MM-DD or DD-MM-YYYY)");
    } else if (row.date > today) {
      row.errors.push("Date is in the future");
    }

    if (!Number.isFinite(row.amount) || row.amount <= 0) {
      row.errors.push("Amount must be greater than 0");
    }

    if (vehicle) {
      row.vehicle_id = vehicle.vehicle_id;
      row.vehicle_no = vehicle.vehicle_no;
      row.driver_id = vehicle.driver_id || null;
      row.driver_name = vehicle.driver_name || null;
      row.bank_issuer = vehicle.bank_issuer || null;
      if (!row.tag_id) row.tag_id = vehicle.account_fastag_id || vehicle.vehicle_fastag_id || "";
    }
    return row;
  });

  const candidates = rows.filter(row => !row.errors.length);
  if (candidates.length) {
    const vehicleIds = [...new Set(candidates.map(row => row.vehicle_id))];
    const dates = candidates.map(row => row.date).sort();
    const fromDate = dates[0];
    const toDate = dates[dates.length - 1];
    const transactionIds = [...new Set(candidates.map(row => row.transaction_id).filter(Boolean))];

    const [existing, trips] = await Promise.all([
      Fastag.getExistingExpenseKeys(transactionIds, vehicleIds, fromDate, toDate),
      Fastag.getTripsForVehicles(vehicleIds, fromDate, toDate),
    ]);

    const existingTxnIds = new Set(existing.map(e => normalizeKey(e.toll_receipt_number)).filter(Boolean));
    // Count-based so re-uploading the same file is caught, while two genuine
    // identical tolls on the same day can still be uploaded together once.
    const existingCounts = new Map();
    existing.forEach(e => {
      const key = duplicateKey(e.vehicle_id, e.expense_date, e.amount, e.toll_plaza);
      existingCounts.set(key, (existingCounts.get(key) || 0) + 1);
    });

    const seenTxnIds = new Set();
    candidates.forEach(row => {
      const txnKey = normalizeKey(row.transaction_id);
      if (txnKey) {
        if (existingTxnIds.has(txnKey)) row.duplicate = "Transaction ID already recorded";
        else if (seenTxnIds.has(txnKey)) row.duplicate = "Duplicate transaction ID in file";
        seenTxnIds.add(txnKey);
      } else {
        const key = duplicateKey(row.vehicle_id, row.date, row.amount, row.toll_plaza);
        const count = existingCounts.get(key) || 0;
        if (count > 0) {
          row.duplicate = "Same vehicle, date, plaza and amount already recorded";
          existingCounts.set(key, count - 1);
        }
      }

      const trip = trips.find(t =>
        t.vehicle_id === row.vehicle_id && t.start_date <= row.date && row.date <= t.end_date
      );
      if (trip) {
        row.trip_id = trip.id;
        row.trip_number = trip.trip_id;
        // The trip's driver wins; driver_id is null when that driver no longer exists.
        if (trip.driver_id || trip.driver_name) {
          row.driver_id = trip.driver_id || null;
          row.driver_name = trip.driver_name || null;
        }
      }
    });
  }

  return rows.map(({ errors, duplicate, vehicle_no_input, ...row }) => ({
    ...row,
    vehicle_no: row.vehicle_no || vehicle_no_input,
    status: errors.length ? "error" : duplicate ? "duplicate" : "valid",
    message: errors.length ? errors.join("; ") : duplicate || "",
  }));
}

function toExpenseEntries(rows, createdBy) {
  const stamp = Date.now();
  return rows.map((row, index) => ({
    expense_number: `EXP-FT-${stamp}-${index + 1}`,
    expense_category: "FASTag",
    vehicle_id: row.vehicle_id,
    vehicle_number: row.vehicle_no,
    driver_id: row.driver_id || null,
    driver_name: row.driver_name || null,
    trip_id: row.trip_id || null,
    trip_number: row.trip_number || null,
    expense_date: row.date,
    amount: row.amount,
    payment_method: "FASTag",
    payment_status: "Paid",
    vendor_payee: row.bank_issuer || null,
    description: row.description || null,
    attachment: "[]",
    toll_plaza: row.toll_plaza || null,
    toll_receipt_number: row.transaction_id || null,
    expense_title: `FASTag Toll${row.toll_plaza ? ` - ${row.toll_plaza}` : ""}`.slice(0, 255),
    created_by: createdBy,
  }));
}

function readRows(req, res) {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;
  if (!rows || !rows.length) {
    res.status(400).json({ success: false, message: "No rows to process" });
    return null;
  }
  if (rows.length > MAX_UPLOAD_ROWS) {
    res.status(400).json({ success: false, message: `Upload at most ${MAX_UPLOAD_ROWS} rows at a time` });
    return null;
  }
  return rows;
}

const summarize = (rows) => ({
  total: rows.length,
  valid: rows.filter(r => r.status === "valid").length,
  duplicate: rows.filter(r => r.status === "duplicate").length,
  error: rows.filter(r => r.status === "error").length,
});

exports.getExpenses = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    const data = await Fastag.getExpenses({ vehicleId, from, to });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET FASTAG EXPENSES ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Dry run: resolves vehicles and flags problems without saving anything.
exports.validateExpenses = async (req, res) => {
  try {
    const rawRows = readRows(req, res);
    if (!rawRows) return;
    const rows = await prepareRows(rawRows);
    res.json({ success: true, summary: summarize(rows), data: rows });
  } catch (error) {
    console.error("VALIDATE FASTAG UPLOAD ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Saves every valid row as a FASTag expense; duplicates and errors are skipped.
exports.bulkUploadExpenses = async (req, res) => {
  try {
    const rawRows = readRows(req, res);
    if (!rawRows) return;
    const rows = await prepareRows(rawRows);
    const validRows = rows.filter(r => r.status === "valid");
    const createdBy = req.user?.username || "FASTag Upload";
    const inserted = await Fastag.insertExpenses(toExpenseEntries(validRows, createdBy));

    if (inserted) {
      const total = validRows.reduce((sum, r) => sum + Number(r.amount), 0);
      await logAudit(req, {
        module_name: "Fastag",
        action: "CREATE",
        description: `Bulk uploaded ${inserted} FASTag expense(s) totalling ₹${total.toFixed(2)} across ${new Set(validRows.map(r => r.vehicle_id)).size} vehicle(s).`,
        new_data: { inserted, skipped: rows.length - inserted, file: req.body.file_name || null },
      });
    }

    res.status(201).json({
      success: true,
      message: `${inserted} FASTag expense(s) added`,
      summary: { ...summarize(rows), inserted },
      data: rows,
    });
  } catch (error) {
    console.error("BULK UPLOAD FASTAG ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const [row] = await prepareRows([req.body || {}]);
    if (row.status !== "valid") {
      return res.status(400).json({ success: false, message: row.message, data: row });
    }
    await Fastag.insertExpenses(toExpenseEntries([row], req.user?.username || "Admin"));

    await logAudit(req, {
      module_name: "Fastag",
      action: "CREATE",
      description: `Added FASTag expense of ₹${row.amount} for ${row.vehicle_no}${row.toll_plaza ? ` at ${row.toll_plaza}` : ""}.`,
      new_data: row,
    });

    res.status(201).json({ success: true, message: "FASTag expense added", data: row });
  } catch (error) {
    console.error("CREATE FASTAG EXPENSE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await Fastag.getExpenseById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: "FASTag expense not found" });
    }
    await Fastag.deleteExpense(id);

    await logAudit(req, {
      module_name: "Fastag",
      action: "DELETE",
      description: `Deleted FASTag expense ${before.expense_number} (₹${before.amount}, ${before.vehicle_number}).`,
      old_data: before,
    });

    res.json({ success: true, message: "FASTag expense deleted" });
  } catch (error) {
    console.error("DELETE FASTAG EXPENSE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
