const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    // Add status column only if it doesn't exist
    const [cols] = await conn.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'inventory_issue_history'
        AND COLUMN_NAME = 'status'
    `);

    if (cols.length === 0) {
      await conn.query(`
        ALTER TABLE inventory_issue_history
        ADD COLUMN status ENUM('Issued','Returned') NOT NULL DEFAULT 'Issued'
      `);
    }

    // Backfill existing rows that were returned via part_returns
    await conn.query(`
      UPDATE inventory_issue_history h
      INNER JOIN part_returns r ON r.original_issue_id = h.id
      SET h.status = 'Returned'
      WHERE h.status = 'Issued'
    `);

    console.log('✅ inventory_issue_history.status column added and backfilled');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
