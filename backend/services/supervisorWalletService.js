const db = require('../config/db');

// ======================================================
// Supervisor wallet ledger.
//
// Every change to supervisors.wallet_balance goes through post(), which
// updates the balance and records the movement in
// supervisor_wallet_transactions in one DB transaction — so the balance
// and the statement can never disagree. Amounts are signed:
// + money into the wallet, − money out of it. The wallet may go negative.
// ======================================================

const TYPES = {
  OPENING: 'Opening Balance',
  TOP_UP: 'Add Money',
  TRIP_ADVANCE: 'Trip Advance',
  FUEL: 'Fuel (Driver Advance)',
  SETTLEMENT: 'Trip Settlement',
  EXPENSE: 'Expense',
  ADJUSTMENT: 'Adjustment',
};

const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const round2 = (n) => Math.round(Number(n) * 100) / 100;

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS supervisor_wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      supervisor_id INT NOT NULL,
      txn_date DATE NOT NULL,
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      balance_after DECIMAL(12,2) NOT NULL,
      trip_id INT NULL,
      trip_code VARCHAR(50) NULL,
      vehicle_no VARCHAR(50) NULL,
      fuel_entry_id INT NULL,
      expense_entry_id INT NULL,
      payment_mode VARCHAR(50) NULL,
      reference_no VARCHAR(100) NULL,
      description VARCHAR(255) NULL,
      notes TEXT NULL,
      created_by VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      KEY idx_swt_supervisor_date (supervisor_id, txn_date, id),
      KEY idx_swt_trip (trip_id, type)
    )
  `);

  // Start every existing supervisor's statement with today's balance —
  // earlier movements were never recorded, so they can't be listed.
  await db.query(`
    INSERT INTO supervisor_wallet_transactions
      (supervisor_id, txn_date, type, amount, balance_after, description, created_by)
    SELECT s.id, ?, ?, COALESCE(s.wallet_balance, 0), COALESCE(s.wallet_balance, 0),
           'Balance when the wallet statement started', 'System'
    FROM supervisors s
    WHERE NOT EXISTS (SELECT 1 FROM supervisor_wallet_transactions t WHERE t.supervisor_id = s.id)
  `, [todayIST(), TYPES.OPENING]);

  await reconcile();
}

// Self-heal: if a balance was changed outside the ledger (e.g. an older
// deployment sharing this database), record the difference so the
// statement still adds up to the real balance.
async function reconcile() {
  await db.query(`
    INSERT INTO supervisor_wallet_transactions
      (supervisor_id, txn_date, type, amount, balance_after, description, created_by)
    SELECT s.id, ?, ?, ROUND(COALESCE(s.wallet_balance, 0) - x.total, 2), COALESCE(s.wallet_balance, 0),
           'Balance correction: changed outside the wallet statement', 'System'
    FROM supervisors s
    JOIN (SELECT supervisor_id, SUM(amount) AS total FROM supervisor_wallet_transactions GROUP BY supervisor_id) x
      ON x.supervisor_id = s.id
    WHERE ROUND(COALESCE(s.wallet_balance, 0) - x.total, 2) <> 0
  `, [todayIST(), TYPES.ADJUSTMENT]);
}

/**
 * Apply a signed amount to a supervisor's wallet and record it.
 * Returns the new balance, or null if the supervisor doesn't exist.
 */
async function post({
  supervisorId, amount, type, date, tripId = null, tripCode = null, vehicleNo = null,
  fuelEntryId = null, expenseEntryId = null, paymentMode = null, referenceNo = null,
  description = null, notes = null, createdBy = null,
}) {
  const value = round2(amount);
  if (!supervisorId || !Number.isFinite(value) || value === 0) return null;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[sup]] = await conn.query(
      'SELECT wallet_balance FROM supervisors WHERE id = ? FOR UPDATE', [supervisorId]
    );
    if (!sup) { await conn.rollback(); return null; }

    const balanceAfter = round2(Number(sup.wallet_balance || 0) + value);
    await conn.query('UPDATE supervisors SET wallet_balance = ? WHERE id = ?', [balanceAfter, supervisorId]);
    await conn.query(
      `INSERT INTO supervisor_wallet_transactions
        (supervisor_id, txn_date, type, amount, balance_after, trip_id, trip_code, vehicle_no,
         fuel_entry_id, expense_entry_id, payment_mode, reference_no, description, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [supervisorId, date || todayIST(), type, value, balanceAfter, tripId, tripCode, vehicleNo,
       fuelEntryId, expenseEntryId, paymentMode, referenceNo,
       description ? String(description).slice(0, 255) : null, notes, createdBy]
    );
    await conn.commit();
    return balanceAfter;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Ledger line for a supervisor created with a starting balance (the balance
// itself is already stored by the INSERT).
async function recordOpening(supervisorId, amount, createdBy) {
  await db.query(
    `INSERT INTO supervisor_wallet_transactions
      (supervisor_id, txn_date, type, amount, balance_after, description, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [supervisorId, todayIST(), TYPES.OPENING, round2(amount || 0), round2(amount || 0),
     'Opening balance when supervisor was added', createdBy || null]
  );
}

async function hasTripSettlement(tripId) {
  const [[row]] = await db.query(
    'SELECT id FROM supervisor_wallet_transactions WHERE trip_id = ? AND type = ? LIMIT 1',
    [tripId, TYPES.SETTLEMENT]
  );
  return !!row;
}

module.exports = { TYPES, ensureTable, reconcile, post, recordOpening, hasTripSettlement, todayIST };
