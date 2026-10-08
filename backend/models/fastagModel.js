const db = require("../config/db");

const Fastag = {

  getAllAccounts: async () => {
    const [rows] = await db.query(`
      SELECT
        fa.*,
        v.vehicle_no
      FROM fastag_accounts fa
      LEFT JOIN vehicles v ON v.id = fa.vehicle_id
      ORDER BY fa.created_at DESC
    `);
    return rows;
  },

  getAccountById: async (id) => {
    const [rows] = await db.query(
      `SELECT fa.*, v.vehicle_no FROM fastag_accounts fa
       LEFT JOIN vehicles v ON v.id = fa.vehicle_id
       WHERE fa.id = ?`,
      [id]
    );
    return rows[0];
  },

  getAccountByVehicle: async (vehicleId) => {
    const [rows] = await db.query(
      `SELECT fa.*, v.vehicle_no FROM fastag_accounts fa
       LEFT JOIN vehicles v ON v.id = fa.vehicle_id
       WHERE fa.vehicle_id = ?`,
      [vehicleId]
    );
    return rows[0];
  },

  createAccount: async (data) => {
    const [result] = await db.query(
      `INSERT INTO fastag_accounts
        (vehicle_id, fastag_id, bank_issuer, linked_account_no, balance, low_balance_threshold, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.vehicle_id,
        data.fastag_id || null,
        data.bank_issuer || null,
        data.linked_account_no || null,
        data.balance || 0,
        data.low_balance_threshold || 200,
        data.status || "Active",
      ]
    );
    return result;
  },

  updateAccount: async (id, data) => {
    const [result] = await db.query(
      `UPDATE fastag_accounts
       SET fastag_id = ?, bank_issuer = ?, linked_account_no = ?, low_balance_threshold = ?, status = ?
       WHERE id = ?`,
      [
        data.fastag_id,
        data.bank_issuer,
        data.linked_account_no,
        data.low_balance_threshold,
        data.status,
        id,
      ]
    );
    return result;
  },

  postMonthlyFuel: async ({ fastagAccountId, fuelDate }) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [[account]] = await conn.query(
        `SELECT id, balance
         FROM fastag_accounts
         WHERE id = ?
         FOR UPDATE`,
        [fastagAccountId]
      );
      if (!account) throw new Error('Fastag account not found');

      const [[monthlyFuel]] = await conn.query(
        `SELECT COALESCE(SUM(total_cost), 0) AS amount
         FROM fuel_entries
         WHERE fastag_account_id = ?
           AND payment_method = 'FASTag Wallet'
           AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')`,
        [fastagAccountId, fuelDate]
      );
      const monthlyAmount = Number(monthlyFuel.amount || 0);

      const [[posting]] = await conn.query(
        `SELECT p.transaction_id, p.amount, t.balance_after
         FROM fastag_monthly_postings p
         JOIN fastag_transactions t ON t.id = p.transaction_id
         WHERE p.fastag_account_id = ? AND p.month = DATE_FORMAT(?, '%Y-%m-01')
         FOR UPDATE`,
        [fastagAccountId, fuelDate]
      );

      const previousAmount = Number(posting?.amount || 0);
      const difference = monthlyAmount - previousAmount;
      const newBalance = Number(account.balance) - difference;
      let transactionId = posting?.transaction_id;

      if (posting) {
        await conn.query(
          `UPDATE fastag_transactions
           SET amount = ?, balance_after = ?
           WHERE id = ?`,
          [monthlyAmount, newBalance, transactionId]
        );
        await conn.query(
          `UPDATE fastag_monthly_postings SET amount = ? WHERE id = ?`,
          [monthlyAmount, posting.transaction_id]
        );
      } else {
        const [transaction] = await conn.query(
          `INSERT INTO fastag_transactions
            (fastag_account_id, type, amount, date, toll_plaza_name, balance_after, created_by)
           VALUES (?, 'fuel_monthly', ?, DATE_FORMAT(?, '%Y-%m-01'), ?, ?, 'Fuel Logs')`,
          [
            fastagAccountId,
            monthlyAmount,
            fuelDate,
            `Fuel usage - ${String(fuelDate).slice(0, 7)}`,
            newBalance,
          ]
        );
        transactionId = transaction.insertId;
        await conn.query(
          `INSERT INTO fastag_monthly_postings
            (fastag_account_id, month, amount, transaction_id)
           VALUES (?, DATE_FORMAT(?, '%Y-%m-01'), ?, ?)`,
          [fastagAccountId, fuelDate, monthlyAmount, transactionId]
        );
      }

      if (difference !== 0) {
        await conn.query(
          `UPDATE fastag_accounts SET balance = ? WHERE id = ?`,
          [newBalance, fastagAccountId]
        );
      }

      await conn.commit();
      return { amount: monthlyAmount, difference, balance: newBalance, transactionId };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  getTransactionsByAccount: async (accountId) => {
    const [rows] = await db.query(
      `SELECT * FROM fastag_transactions WHERE fastag_account_id = ? ORDER BY date DESC, id DESC`,
      [accountId]
    );
    return rows;
  },

  // ========================================
  // FASTAG EXPENSES
  // FASTag deductions are stored as truck expenses (expense_entries,
  // category 'FASTag'). There is no wallet/balance tracking.
  // ========================================

  // Every vehicle with its tag id(s) and currently assigned driver,
  // used to resolve uploaded rows by vehicle number or tag id.
  getVehicleLookup: async () => {
    const [rows] = await db.query(`
      SELECT
        v.id AS vehicle_id,
        v.vehicle_no,
        v.fastag_id AS vehicle_fastag_id,
        fa.fastag_id AS account_fastag_id,
        fa.bank_issuer,
        d.id AS driver_id,
        d.full_name AS driver_name
      FROM vehicles v
      LEFT JOIN fastag_accounts fa ON fa.vehicle_id = v.id
      LEFT JOIN drivers d ON d.id = v.assigned_driver
    `);
    return rows;
  },

  // Trips running on the given vehicles between the two dates, so each
  // FASTag deduction can be attached to the trip it happened on.
  getTripsForVehicles: async (vehicleIds, fromDate, toDate) => {
    if (!vehicleIds.length) return [];
    const [rows] = await db.query(
      `SELECT
         t.id,
         t.trip_id,
         t.vehicle_id,
         -- trips can point at drivers that no longer exist; expense_entries.driver_id has an FK
         d.id AS driver_id,
         COALESCE(NULLIF(TRIM(t.driver_name), ''), d.full_name) AS driver_name,
         DATE_FORMAT(DATE(COALESCE(t.start_time, t.trip_date)), '%Y-%m-%d') AS start_date,
         DATE_FORMAT(DATE(COALESCE(
           t.unloading_time,
           CASE WHEN t.trip_status IN ('Started', 'In Transit') THEN CURDATE() END,
           t.eta,
           t.start_time,
           t.trip_date
         )), '%Y-%m-%d') AS end_date
       FROM trips t
       LEFT JOIN drivers d ON d.id = t.driver_id
       WHERE t.vehicle_id IN (?)
         AND COALESCE(t.is_deleted, 0) = 0
         AND COALESCE(t.trip_status, '') NOT IN ('Draft', 'Cancelled')
         AND DATE(COALESCE(t.start_time, t.trip_date)) <= ?
         AND DATE(COALESCE(t.unloading_time, CASE WHEN t.trip_status IN ('Started', 'In Transit') THEN CURDATE() END, t.eta, t.start_time, t.trip_date)) >= ?
       ORDER BY COALESCE(t.start_time, t.trip_date) DESC`,
      [vehicleIds, toDate, fromDate]
    );
    return rows;
  },

  // Existing FASTag expenses that could clash with an upload: same
  // transaction id anywhere, or same vehicle within the date range.
  getExistingExpenseKeys: async (transactionIds, vehicleIds, fromDate, toDate) => {
    const conditions = [];
    const params = [];
    if (transactionIds.length) {
      conditions.push("toll_receipt_number IN (?)");
      params.push(transactionIds);
    }
    if (vehicleIds.length) {
      conditions.push("(vehicle_id IN (?) AND expense_date BETWEEN ? AND ?)");
      params.push(vehicleIds, fromDate, toDate);
    }
    if (!conditions.length) return [];
    const [rows] = await db.query(
      `SELECT vehicle_id, DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
              amount, toll_plaza, toll_receipt_number
       FROM expense_entries
       WHERE expense_category = 'FASTag'
         AND COALESCE(entry_status, '') != 'Deleted'
         AND (${conditions.join(" OR ")})`,
      params
    );
    return rows;
  },

  insertExpenses: async (entries) => {
    if (!entries.length) return 0;
    const columns = [
      "expense_number", "expense_category", "vehicle_id", "vehicle_number",
      "driver_id", "driver_name", "trip_id", "trip_number", "expense_date",
      "amount", "payment_method", "payment_status", "vendor_payee",
      "description", "attachment", "toll_plaza", "toll_receipt_number",
      "expense_title", "created_by",
    ];
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (let start = 0; start < entries.length; start += 500) {
        const chunk = entries.slice(start, start + 500);
        await conn.query(
          `INSERT INTO expense_entries (${columns.join(", ")}) VALUES ?`,
          [chunk.map(entry => columns.map(column => entry[column] ?? null))]
        );
      }
      await conn.commit();
      return entries.length;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  // FASTag expenses plus any toll deductions recorded under the old
  // wallet flow, so history stays visible in one list.
  getExpenses: async (filters = {}) => {
    const expenseConditions = ["e.expense_category = 'FASTag'", "COALESCE(e.entry_status, '') != 'Deleted'"];
    const legacyConditions = ["t.type = 'toll_deduction'"];
    const expenseParams = [];
    const legacyParams = [];

    if (filters.vehicleId) {
      expenseConditions.push("e.vehicle_id = ?");
      expenseParams.push(filters.vehicleId);
      legacyConditions.push("fa.vehicle_id = ?");
      legacyParams.push(filters.vehicleId);
    }
    if (filters.from) {
      expenseConditions.push("e.expense_date >= ?");
      expenseParams.push(filters.from);
      legacyConditions.push("t.date >= ?");
      legacyParams.push(filters.from);
    }
    if (filters.to) {
      expenseConditions.push("e.expense_date <= ?");
      expenseParams.push(filters.to);
      legacyConditions.push("t.date <= ?");
      legacyParams.push(filters.to);
    }

    const [rows] = await db.query(
      `SELECT
         e.id,
         'expense' AS source,
         e.expense_number,
         e.vehicle_id,
         COALESCE(v.vehicle_no, e.vehicle_number) AS vehicle_no,
         e.driver_name,
         e.trip_id,
         e.trip_number,
         DATE_FORMAT(e.expense_date, '%Y-%m-%d') AS date,
         e.amount,
         e.toll_plaza,
         e.toll_receipt_number AS transaction_id,
         e.description,
         e.created_by,
         e.created_at
       FROM expense_entries e
       LEFT JOIN vehicles v ON v.id = e.vehicle_id
       WHERE ${expenseConditions.join(" AND ")}
       UNION ALL
       SELECT
         t.id,
         'legacy' AS source,
         NULL AS expense_number,
         fa.vehicle_id,
         v.vehicle_no,
         NULL AS driver_name,
         NULL AS trip_id,
         NULL AS trip_number,
         DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
         t.amount,
         t.toll_plaza_name AS toll_plaza,
         t.reference_no AS transaction_id,
         NULL AS description,
         t.created_by,
         t.created_at
       FROM fastag_transactions t
       JOIN fastag_accounts fa ON fa.id = t.fastag_account_id
       LEFT JOIN vehicles v ON v.id = fa.vehicle_id
       WHERE ${legacyConditions.join(" AND ")}
       ORDER BY date DESC, created_at DESC`,
      [...expenseParams, ...legacyParams]
    );
    return rows;
  },

  getExpenseById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM expense_entries
       WHERE id = ? AND expense_category = 'FASTag' AND COALESCE(entry_status, '') != 'Deleted'`,
      [id]
    );
    return rows[0];
  },

  deleteExpense: async (id) => {
    const [result] = await db.query(
      `UPDATE expense_entries SET entry_status = 'Deleted'
       WHERE id = ? AND expense_category = 'FASTag'`,
      [id]
    );
    return result;
  },

};

module.exports = Fastag;
