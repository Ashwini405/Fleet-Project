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

  updateBalance: async (id, newBalance) => {
    const [result] = await db.query(
      `UPDATE fastag_accounts SET balance = ? WHERE id = ?`,
      [newBalance, id]
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

  getAllTransactions: async (filters = {}) => {
    const conditions = [];
    const params = [];

    if (filters.vehicleId) {
      conditions.push("fa.vehicle_id = ?");
      params.push(filters.vehicleId);
    }
    if (filters.type) {
      conditions.push("t.type = ?");
      params.push(filters.type);
    }
    if (filters.from) {
      conditions.push("t.date >= ?");
      params.push(filters.from);
    }
    if (filters.to) {
      conditions.push("t.date <= ?");
      params.push(filters.to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await db.query(
      `SELECT
        t.*,
        fa.balance AS account_balance,
        v.vehicle_no,
        fa.fastag_id
      FROM fastag_transactions t
      JOIN fastag_accounts fa ON fa.id = t.fastag_account_id
      LEFT JOIN vehicles v ON v.id = fa.vehicle_id
      ${whereClause}
      UNION ALL
      SELECT
        CONCAT('fuel-month-', fa.vehicle_id, '-', DATE_FORMAT(MIN(f.date), '%Y-%m')) AS id,
        MAX(fa.id) AS fastag_account_id,
        'fuel_monthly' AS type,
        SUM(f.total_cost) AS amount,
        STR_TO_DATE(CONCAT(DATE_FORMAT(MIN(f.date), '%Y-%m'), '-01'), '%Y-%m-%d') AS date,
        CONCAT('Fuel usage - ', DATE_FORMAT(MIN(f.date), '%M %Y')) AS toll_plaza_name,
        MAX(fa.balance) AS balance_after,
        NULL AS reference_no,
        NULL AS proof_upload,
        'Fuel Logs' AS created_by,
        NULL AS created_at,
        MAX(fa.balance) AS account_balance,
        MAX(v.vehicle_no) AS vehicle_no,
        MAX(fa.fastag_id) AS fastag_id
      FROM fuel_entries f
      JOIN fastag_accounts fa ON fa.id = f.fastag_account_id
      LEFT JOIN vehicles v ON v.id = f.vehicle_id
      WHERE f.payment_method = 'FASTag Wallet'
        AND f.fastag_account_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM fastag_monthly_postings p
          WHERE p.fastag_account_id = f.fastag_account_id
            AND p.month = STR_TO_DATE(CONCAT(DATE_FORMAT(f.date, '%Y-%m'), '-01'), '%Y-%m-%d')
        )
        ${filters.type && filters.type !== 'fuel_monthly' ? 'AND 1 = 0' : ''}
        ${filters.vehicleId ? 'AND fa.vehicle_id = ?' : ''}
        ${filters.from ? 'AND f.date >= ?' : ''}
        ${filters.to ? 'AND f.date <= ?' : ''}
      GROUP BY fa.vehicle_id, DATE_FORMAT(f.date, '%Y-%m')
      ORDER BY date DESC, id DESC`,
      [...params, ...(filters.vehicleId ? [filters.vehicleId] : []), ...(filters.from ? [filters.from] : []), ...(filters.to ? [filters.to] : [])]
    );

    if (!filters.type && !filters.from && !filters.to) {
      const byAccount = new Map();
      rows.forEach(row => {
        const accountRows = byAccount.get(row.fastag_account_id) || [];
        accountRows.push(row);
        byAccount.set(row.fastag_account_id, accountRows);
      });

      byAccount.forEach(accountRows => {
        accountRows.sort((a, b) => {
          const dateDiff = new Date(a.date) - new Date(b.date);
          if (dateDiff !== 0) return dateDiff;
          const createdDiff = new Date(a.created_at || a.date) - new Date(b.created_at || b.date);
          if (createdDiff !== 0) return createdDiff;
          return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
        });

        let runningBalance = Number(accountRows[0]?.account_balance || 0);
        for (let index = accountRows.length - 1; index >= 0; index -= 1) {
          const row = accountRows[index];
          row.balance_after = runningBalance;
          const change = row.type === 'recharge'
            ? Number(row.amount || 0)
            : -Number(row.amount || 0);
          runningBalance -= change;
        }
      });

      rows.sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        const createdDiff = new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
        if (createdDiff !== 0) return createdDiff;
        return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
      });
    }

    return rows;
  },

  createTransaction: async (data) => {
    const [result] = await db.query(
      `INSERT INTO fastag_transactions
        (fastag_account_id, type, amount, date, toll_plaza_name, balance_after, reference_no, proof_upload, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.fastag_account_id,
        data.type,
        data.amount,
        data.date,
        data.toll_plaza_name || null,
        data.balance_after,
        data.reference_no || null,
        data.proof_upload || null,
        data.created_by || "Admin",
      ]
    );
    return result;
  },

};

module.exports = Fastag;
