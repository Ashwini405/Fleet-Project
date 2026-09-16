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
        MAX(v.vehicle_no) AS vehicle_no,
        MAX(fa.fastag_id) AS fastag_id
      FROM fuel_entries f
      JOIN fastag_accounts fa ON fa.id = f.fastag_account_id
      LEFT JOIN vehicles v ON v.id = f.vehicle_id
      WHERE f.payment_method = 'FASTag Wallet'
        AND f.fastag_account_id IS NOT NULL
        ${filters.type && filters.type !== 'fuel_monthly' ? 'AND 1 = 0' : ''}
        ${filters.vehicleId ? 'AND fa.vehicle_id = ?' : ''}
        ${filters.from ? 'AND f.date >= ?' : ''}
        ${filters.to ? 'AND f.date <= ?' : ''}
      GROUP BY fa.vehicle_id, DATE_FORMAT(f.date, '%Y-%m')
      ORDER BY date DESC, id DESC`,
      [...params, ...(filters.vehicleId ? [filters.vehicleId] : []), ...(filters.from ? [filters.from] : []), ...(filters.to ? [filters.to] : [])]
    );
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
