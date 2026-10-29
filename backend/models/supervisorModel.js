const db = require('../config/db');

const Supervisor = {

  getLedger: async (id) => {
    const [[supervisor]] = await db.query(`
      SELECT s.*, st.station_name
      FROM supervisors s
      LEFT JOIN stations st ON s.station_id = st.id
      WHERE s.id = ?
    `, [id]);

    if (!supervisor) return null;

    const [vehicles] = await db.query(`
      SELECT
        v.id,
        v.vehicle_no,
        v.assigned_driver AS driver_id,
        d.full_name AS driver_name
      FROM vehicles v
      LEFT JOIN drivers d ON d.id = v.assigned_driver
      WHERE v.supervisor_id = ?
      ORDER BY v.vehicle_no
    `, [id]);

    const [drivers] = await db.query(`
      SELECT DISTINCT
        d.id,
        d.full_name,
        d.mobile,
        d.status,
        v.id AS vehicle_id,
        v.vehicle_no
      FROM vehicles v
      INNER JOIN drivers d ON d.id = v.assigned_driver
      WHERE v.supervisor_id = ?
      ORDER BY d.full_name
    `, [id]);

    const [advances] = await db.query(`
      SELECT
        t.id,
        t.trip_id,
        t.trip_date,
        t.truck_no,
        t.driver_name,
        t.source,
        t.destination,
        t.trip_status,
        COALESCE(t.driver_advance, 0) AS driver_advance,
        COALESCE(t.hamali_advance, 0) AS hamali_advance,
        COALESCE(t.other_advance, 0) AS other_advance,
        COALESCE(t.driver_advance, 0) +
          COALESCE(t.hamali_advance, 0) +
          COALESCE(t.other_advance, 0) AS total_advance
      FROM trips t
      WHERE t.supervisor_id = ?
        AND COALESCE(t.is_deleted, 0) = 0
        AND (
          COALESCE(t.driver_advance, 0) +
          COALESCE(t.hamali_advance, 0) +
          COALESCE(t.other_advance, 0)
        ) > 0
      ORDER BY t.trip_date DESC, t.id DESC
    `, [id]);

    const [expenses] = await db.query(`
      SELECT id, expense_number, expense_category, vehicle_number,
             driver_name, expense_date, amount, payment_method,
             vendor_payee, description, created_at
      FROM expense_entries
      WHERE supervisor_id = ? AND entry_status != 'Deleted'
      ORDER BY expense_date DESC, id DESC
    `, [id]);

    const [previousWalletTransactions] = await db.query(`
      SELECT id, txn_date, type, amount, created_at
      FROM supervisor_wallet_transactions
      WHERE supervisor_id = ?
      ORDER BY txn_date DESC, id DESC
    `, [id]);

    const [walletCredits] = await db.query(`
      SELECT id, amount, created_at
      FROM supervisor_wallet_credits
      WHERE supervisor_id = ?
      ORDER BY created_at DESC, id DESC
    `, [id]);

    const walletHistory = [
      ...previousWalletTransactions.map(transaction => ({
        id: `transaction-${transaction.id}`,
        date: transaction.txn_date || transaction.created_at,
        type: transaction.type || 'Wallet Transaction',
        amount: Number(transaction.amount || 0),
      })),
      ...walletCredits.map(credit => ({
        id: `credit-${credit.id}`,
        date: credit.created_at,
        type: 'Wallet Addition',
        amount: Number(credit.amount || 0),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      supervisor,
      drivers,
      vehicles,
      advances,
      expenses,
      wallet_credits: walletHistory,
      total_advances: advances.reduce((total, item) => total + Number(item.total_advance || 0), 0),
      total_expenses: expenses.reduce((total, item) => total + Number(item.amount || 0), 0),
    };
  },

  addWalletCredit: async (supervisorId, amount) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [[supervisor]] = await connection.query(
        'SELECT id FROM supervisors WHERE id = ? FOR UPDATE',
        [supervisorId]
      );
      if (!supervisor) {
        await connection.rollback();
        return { error: 'Supervisor not found.' };
      }

      await connection.query(
        'INSERT INTO supervisor_wallet_credits (supervisor_id, amount) VALUES (?, ?)',
        [supervisorId, amount]
      );
      await connection.query(
        'UPDATE supervisors SET wallet_balance = COALESCE(wallet_balance, 0) + ? WHERE id = ?',
        [amount, supervisorId]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  createLedgerExpense: async (supervisorId, expense) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [[supervisor]] = await connection.query(
        'SELECT id, full_name, wallet_balance FROM supervisors WHERE id = ? FOR UPDATE',
        [supervisorId]
      );
      if (!supervisor) {
        await connection.rollback();
        return { error: 'Supervisor not found.' };
      }

      const [[vehicle]] = await connection.query(`
        SELECT v.id, v.vehicle_no, d.id AS driver_id, d.full_name AS driver_name
        FROM vehicles v
        LEFT JOIN drivers d ON d.id = v.assigned_driver
        WHERE v.id = ? AND v.supervisor_id = ?
      `, [expense.vehicle_id, supervisorId]);
      if (!vehicle) {
        await connection.rollback();
        return { error: 'Select a vehicle assigned to this supervisor.' };
      }

      const amount = Number(expense.amount);
      if (amount > Number(supervisor.wallet_balance || 0)) {
        await connection.rollback();
        return { error: 'Expense amount exceeds the supervisor wallet balance.' };
      }

      const expenseNumber = `SUP-EXP-${Date.now()}`;
      await connection.query(`
        INSERT INTO expense_entries (
          expense_number, expense_category, vehicle_id, vehicle_number,
          driver_id, driver_name, supervisor_id, supervisor_name,
          expense_date, amount, payment_method, payment_status,
          vendor_payee, description, attachment, entry_status, created_by
        ) VALUES (?, 'Supervisor Expense', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?, ?, JSON_ARRAY(), 'Active', 'Supervisor Ledger')
      `, [
        expenseNumber,
        vehicle.id,
        vehicle.vehicle_no,
        vehicle.driver_id,
        vehicle.driver_name,
        supervisor.id,
        supervisor.full_name,
        expense.expense_date,
        amount,
        expense.payment_method,
        expense.vendor_payee || null,
        expense.description,
      ]);

      await connection.query(
        'UPDATE supervisors SET wallet_balance = wallet_balance - ? WHERE id = ?',
        [amount, supervisorId]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // CREATE
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO supervisors
      (full_name, mobile, id_card_number, status, address, station_id,
       wallet_balance, bank_name, account_number, ifsc_code, notes,
       profile_photo, id_document, bank_document)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.status,
        data.address,
        data.station_id || null,
        data.wallet_balance ? Number(data.wallet_balance) : 0,
        data.bank_name,
        data.account_number,
        data.ifsc_code,
        data.notes || null,
        data.profile_photo || null,
        data.id_document   || null,
        data.bank_document || null,
      ]
    );

    // Human-readable Supervisor ID, generated from the row's own auto-increment id
    const supervisorCode = `SUP-${String(result.insertId).padStart(4, '0')}`;
    await db.query(
      "UPDATE supervisors SET supervisor_code = ? WHERE id = ?",
      [supervisorCode, result.insertId]
    );

    return { ...result, supervisor_code: supervisorCode };
  },

  // GET ALL (with station name JOIN 🔥)
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT s.*, st.station_name
      FROM supervisors s
      LEFT JOIN stations st ON s.station_id = st.id
      ORDER BY s.created_at DESC
    `);
    return rows;
  },

  // UPDATE
  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE supervisors SET
        full_name=?, mobile=?, id_card_number=?, status=?, address=?, station_id=?,
        wallet_balance=?, bank_name=?, account_number=?, ifsc_code=?, notes=?,
        profile_photo=COALESCE(?, profile_photo),
        id_document=COALESCE(?, id_document),
        bank_document=COALESCE(?, bank_document)
       WHERE id=?`,
      [
        data.full_name,
        data.mobile,
        data.id_card_number,
        data.status,
        data.address,
        data.station_id || null,
        data.wallet_balance !== '' && data.wallet_balance != null ? Number(data.wallet_balance) : 0,
        data.bank_name,
        data.account_number,
        data.ifsc_code,
        data.notes || null,
        data.profile_photo || null,
        data.id_document || null,
        data.bank_document || null,
        id
      ]
    );
    return result;
  },

  // DELETE
  delete: async (id) => {
    const [result] = await db.query(
      "DELETE FROM supervisors WHERE id = ?",
      [id]
    );
    return result;
  }

};

module.exports = Supervisor;