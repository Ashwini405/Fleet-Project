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
    if (!(await columnExists(conn, 'income_entries', 'refund_type'))) {
      await conn.query(`ALTER TABLE income_entries ADD COLUMN refund_type VARCHAR(50) DEFAULT NULL AFTER income_category`);
      console.log('✅ Added income_entries.refund_type');
    } else {
      console.log('⏭  income_entries.refund_type already exists, skipping');
    }

    if (!(await columnExists(conn, 'income_entries', 'refund_reference'))) {
      await conn.query(`ALTER TABLE income_entries ADD COLUMN refund_reference VARCHAR(255) DEFAULT NULL AFTER refund_type`);
      console.log('✅ Added income_entries.refund_reference');
    } else {
      console.log('⏭  income_entries.refund_reference already exists, skipping');
    }

    console.log('✅ Income category migration complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
