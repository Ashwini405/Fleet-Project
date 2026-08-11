const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

const BANK_COLUMNS = [
  { name: 'bank_name',        ddl: 'VARCHAR(255)' },
  { name: 'custom_bank_name', ddl: 'VARCHAR(255)' },
  { name: 'account_number',   ddl: 'VARCHAR(100)' },
  { name: 'ifsc_code',        ddl: 'VARCHAR(50)' },
  { name: 'upi_id',           ddl: 'VARCHAR(255)' },
];

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
    for (const { name, ddl } of BANK_COLUMNS) {
      if (!(await columnExists(conn, 'tyre_vendors', name))) {
        await conn.query(`ALTER TABLE tyre_vendors ADD COLUMN ${name} ${ddl}`);
        console.log(`✅ Added tyre_vendors.${name}`);
      } else {
        console.log(`⏭  tyre_vendors.${name} already exists, skipping`);
      }
    }
    console.log('✅ Tyre vendor bank details migration complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
