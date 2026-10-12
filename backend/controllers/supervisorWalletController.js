const db = require('../config/db');
const wallet = require('../services/supervisorWalletService');
const { logAudit } = require('../middleware/auditMiddleware');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];
// Finance categories a supervisor can pay from the wallet (fuel goes through Fuel Management).
const EXPENSE_CATEGORIES = ['Toll', 'Food Allowance', 'Maintenance', 'Miscellaneous', 'Other'];

const clean = (v) => String(v ?? '').trim();

async function getSupervisor(id) {
  const [[row]] = await db.query('SELECT id, full_name, wallet_balance FROM supervisors WHERE id = ?', [id]);
  return row;
}

// Manual entries may be back-dated, but not before the statement began and
// not into the future — otherwise the running balance would not add up.
async function checkManualDate(supervisorId, date) {
  if (!DATE_RE.test(date) || Number.isNaN(new Date(date).getTime())) return 'Enter a valid date';
  if (date > wallet.todayIST()) return 'Date cannot be in the future';
  const [[first]] = await db.query(
    `SELECT DATE_FORMAT(MIN(txn_date), '%Y-%m-%d') AS start FROM supervisor_wallet_transactions WHERE supervisor_id = ?`,
    [supervisorId]
  );
  if (first?.start && date < first.start) return `Date cannot be before the wallet statement start (${first.start})`;
  return null;
}

// ── GET /api/supervisor-wallet ── every supervisor with balance + this month's movement
exports.getWallets = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.supervisor_code, s.full_name, s.mobile, s.status, st.station_name,
             COALESCE(s.wallet_balance, 0) AS balance,
             DATE_FORMAT(MAX(t.txn_date), '%Y-%m-%d') AS last_txn_date,
             COALESCE(SUM(CASE WHEN t.type <> ? AND t.amount > 0 AND DATE_FORMAT(t.txn_date, '%Y-%m') = DATE_FORMAT(?, '%Y-%m') THEN t.amount END), 0) AS month_in,
             COALESCE(SUM(CASE WHEN t.amount < 0 AND DATE_FORMAT(t.txn_date, '%Y-%m') = DATE_FORMAT(?, '%Y-%m') THEN -t.amount END), 0) AS month_out
      FROM supervisors s
      LEFT JOIN stations st ON st.id = s.station_id
      LEFT JOIN supervisor_wallet_transactions t ON t.supervisor_id = s.id
      GROUP BY s.id
      ORDER BY s.full_name
    `, [wallet.TYPES.OPENING, wallet.todayIST(), wallet.todayIST()]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('GET SUPERVISOR WALLETS ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── GET /api/supervisor-wallet/:id/statement?from=&to= ──
// Running balance is computed from the amounts in date order, so the
// statement always adds up to the wallet balance.
exports.getStatement = async (req, res) => {
  try {
    const supervisor = await getSupervisor(req.params.id);
    if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });

    const from = DATE_RE.test(req.query.from || '') ? req.query.from : null;
    const to = DATE_RE.test(req.query.to || '') ? req.query.to : null;

    const [[before]] = from
      ? await db.query(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM supervisor_wallet_transactions WHERE supervisor_id = ? AND txn_date < ?',
        [supervisor.id, from])
      : [[{ total: 0 }]];

    const conditions = ['supervisor_id = ?'];
    const params = [supervisor.id];
    if (from) { conditions.push('txn_date >= ?'); params.push(from); }
    if (to) { conditions.push('txn_date <= ?'); params.push(to); }

    const [rows] = await db.query(
      `SELECT id, DATE_FORMAT(txn_date, '%Y-%m-%d') AS date, type, amount, trip_id, trip_code, vehicle_no,
              fuel_entry_id, expense_entry_id, payment_mode, reference_no, description, notes, created_by, created_at
       FROM supervisor_wallet_transactions
       WHERE ${conditions.join(' AND ')}
       ORDER BY txn_date ASC, id ASC`,
      params
    );

    // The "Opening Balance" line (balance when the statement began) is part of
    // the opening figure, not money received in this period.
    const openingRows = rows.filter(r => r.type === wallet.TYPES.OPENING);
    const opening = Number(before.total) + openingRows.reduce((s, r) => s + Number(r.amount), 0);
    const statementStart = openingRows[0]?.date || null;
    let running = opening;
    let credit = 0;
    let debit = 0;
    const lines = rows.filter(r => r.type !== wallet.TYPES.OPENING).map(r => {
      const amount = Number(r.amount);
      running = Math.round((running + amount) * 100) / 100;
      if (amount > 0) credit += amount; else debit += -amount;
      return { ...r, amount, credit: amount > 0 ? amount : 0, debit: amount < 0 ? -amount : 0, balance: running };
    });

    res.json({
      success: true,
      data: {
        supervisor: { id: supervisor.id, name: supervisor.full_name, balance: Number(supervisor.wallet_balance || 0) },
        from, to,
        statementStart,
        opening: Math.round(opening * 100) / 100,
        closing: running,
        totals: { credit, debit },
        lines,
      },
    });
  } catch (error) {
    console.error('GET WALLET STATEMENT ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── POST /api/supervisor-wallet/:id/add-money ──
exports.addMoney = async (req, res) => {
  try {
    const supervisor = await getSupervisor(req.params.id);
    if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });

    const amount = Number(req.body.amount);
    const date = clean(req.body.date) || wallet.todayIST();
    const mode = clean(req.body.payment_mode) || 'Cash';
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Enter an amount greater than 0' });
    if (!PAYMENT_MODES.includes(mode)) return res.status(400).json({ success: false, message: 'Select a valid payment mode' });
    const dateError = await checkManualDate(supervisor.id, date);
    if (dateError) return res.status(400).json({ success: false, message: dateError });

    const balance = await wallet.post({
      supervisorId: supervisor.id, amount, type: wallet.TYPES.TOP_UP, date,
      paymentMode: mode, referenceNo: clean(req.body.reference_no).slice(0, 100) || null,
      description: `Money given to supervisor (${mode})`, notes: clean(req.body.notes) || null,
      createdBy: req.user?.username,
    });

    await logAudit(req, {
      module_name: 'Supervisor Wallet', action: 'CREATE',
      description: `Added ₹${amount} to ${supervisor.full_name}'s wallet (${mode}). New balance ₹${balance}.`,
      new_data: { supervisor_id: supervisor.id, amount, date, mode },
    });
    res.status(201).json({ success: true, message: 'Money added to wallet', data: { balance } });
  } catch (error) {
    console.error('WALLET ADD MONEY ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── POST /api/supervisor-wallet/:id/expense ── (multipart: optional bill)
// Paid by the supervisor from the wallet: deducted here and recorded as a
// Finance expense (payment method "Supervisor Wallet") for the truck / trip.
exports.recordExpense = async (req, res) => {
  try {
    const supervisor = await getSupervisor(req.params.id);
    if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });

    const amount = Number(req.body.amount);
    const date = clean(req.body.date) || wallet.todayIST();
    const category = clean(req.body.category);
    const title = clean(req.body.title).slice(0, 255);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Enter an amount greater than 0' });
    if (!EXPENSE_CATEGORIES.includes(category)) return res.status(400).json({ success: false, message: 'Select an expense category' });
    if (!title) return res.status(400).json({ success: false, message: 'Enter what the expense was for' });
    const dateError = await checkManualDate(supervisor.id, date);
    if (dateError) return res.status(400).json({ success: false, message: dateError });

    let vehicle = null;
    if (req.body.vehicle_id) {
      [[vehicle]] = await db.query('SELECT id, vehicle_no FROM vehicles WHERE id = ?', [req.body.vehicle_id]);
      if (!vehicle) return res.status(400).json({ success: false, message: 'Vehicle not found' });
    }
    let trip = null;
    if (req.body.trip_id) {
      [[trip]] = await db.query('SELECT id, trip_id, vehicle_id, truck_no FROM trips WHERE id = ? AND is_deleted = 0', [req.body.trip_id]);
      if (!trip) return res.status(400).json({ success: false, message: 'Trip not found' });
      if (vehicle && trip.vehicle_id && trip.vehicle_id !== vehicle.id) {
        return res.status(400).json({ success: false, message: `Trip ${trip.trip_id} belongs to a different vehicle` });
      }
    }
    const vehicleId = vehicle?.id || trip?.vehicle_id || null;
    const vehicleNo = vehicle?.vehicle_no || trip?.truck_no || null;

    const [entry] = await db.query('INSERT INTO expense_entries SET ?', [{
      expense_number: `EXP-SW-${Date.now()}`,
      expense_category: category,
      expense_title: title,
      vehicle_id: vehicleId,
      vehicle_number: vehicleNo,
      supervisor_id: supervisor.id,
      supervisor_name: supervisor.full_name,
      trip_id: trip?.id || null,
      trip_number: trip?.trip_id || null,
      expense_date: date,
      amount,
      payment_method: 'Supervisor Wallet',
      payment_status: 'Paid',
      vendor_payee: clean(req.body.paid_to).slice(0, 255) || null,
      description: clean(req.body.notes) || title,
      attachment: JSON.stringify(req.file ? [req.file.filename] : []),
      created_by: req.user?.username || 'Supervisor Wallet',
    }]);

    let balance;
    try {
      balance = await wallet.post({
        supervisorId: supervisor.id, amount: -amount, type: wallet.TYPES.EXPENSE, date,
        tripId: trip?.id || null, tripCode: trip?.trip_id || null, vehicleNo,
        expenseEntryId: entry.insertId, description: `${category}: ${title}`,
        notes: clean(req.body.notes) || null, createdBy: req.user?.username,
      });
    } catch (error) {
      // keep Finance and the wallet in step if the wallet update fails
      await db.query("UPDATE expense_entries SET entry_status = 'Deleted' WHERE id = ?", [entry.insertId]);
      throw error;
    }

    await logAudit(req, {
      module_name: 'Supervisor Wallet', action: 'CREATE',
      description: `Recorded ₹${amount} ${category} expense (${title}) paid by ${supervisor.full_name}${vehicleNo ? ` for ${vehicleNo}` : ''}. Wallet ₹${balance}.`,
      new_data: { supervisor_id: supervisor.id, amount, category, title, vehicleNo, trip: trip?.trip_id },
    });
    res.status(201).json({ success: true, message: 'Expense recorded', data: { balance, expense_entry_id: entry.insertId } });
  } catch (error) {
    console.error('WALLET EXPENSE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── POST /api/supervisor-wallet/:id/adjust ── correction, + or −, reason required
exports.adjust = async (req, res) => {
  try {
    const supervisor = await getSupervisor(req.params.id);
    if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });

    const amount = Math.round(Number(req.body.amount) * 100) / 100;
    const reason = clean(req.body.reason);
    const date = clean(req.body.date) || wallet.todayIST();
    if (!Number.isFinite(amount) || amount === 0) return res.status(400).json({ success: false, message: 'Enter a non-zero amount (use minus to reduce)' });
    if (!reason) return res.status(400).json({ success: false, message: 'Enter the reason for the adjustment' });
    const dateError = await checkManualDate(supervisor.id, date);
    if (dateError) return res.status(400).json({ success: false, message: dateError });

    const balance = await wallet.post({
      supervisorId: supervisor.id, amount, type: wallet.TYPES.ADJUSTMENT, date,
      description: reason.slice(0, 255), createdBy: req.user?.username,
    });

    await logAudit(req, {
      module_name: 'Supervisor Wallet', action: 'UPDATE',
      description: `Adjusted ${supervisor.full_name}'s wallet by ₹${amount}: ${reason}. New balance ₹${balance}.`,
      new_data: { supervisor_id: supervisor.id, amount, reason, date },
    });
    res.status(201).json({ success: true, message: 'Wallet adjusted', data: { balance } });
  } catch (error) {
    console.error('WALLET ADJUST ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
exports.PAYMENT_MODES = PAYMENT_MODES;
