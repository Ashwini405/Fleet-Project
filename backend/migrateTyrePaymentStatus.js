const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    if (!(await columnExists(conn, 'tyres', 'paid_amount'))) {
      await conn.query(`ALTER TABLE tyres ADD COLUMN paid_amount DECIMAL(12,2) DEFAULT 0`);
      console.log('✅ Added tyres.paid_amount');
    } else {
      console.log('⏭  tyres.paid_amount already exists, skipping');
    }

    if (!(await columnExists(conn, 'tyres', 'payment_status'))) {
      await conn.query(`ALTER TABLE tyres ADD COLUMN payment_status ENUM('Unpaid','Partially Paid','Paid') DEFAULT 'Unpaid'`);
      console.log('✅ Added tyres.payment_status');
    } else {
      console.log('⏭  tyres.payment_status already exists, skipping');
    }

    // Cash-vendor purchases are settled at time of purchase — mark them Paid
    // so they don't show as outstanding once this column exists.
    await conn.query(`
      UPDATE tyres t
      JOIN tyre_vendors v ON v.vendor_name = t.vendor_name
      SET t.payment_status = 'Paid', t.paid_amount = t.tyre_cost
      WHERE v.payment_terms = 'cash' AND t.payment_status = 'Unpaid'
    `);
    console.log('✅ Backfilled cash-vendor tyre purchases as Paid');

    console.log('✅ Migration complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
