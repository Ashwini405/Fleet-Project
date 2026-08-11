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

async function fkExists(conn, table, constraintName) {
  const [rows] = await conn.query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
    [table, constraintName]
  );
  return rows.length > 0;
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    // 1. tyres.warranty_months — tracked per registered tyre
    if (!(await columnExists(conn, 'tyres', 'warranty_months'))) {
      await conn.query(`ALTER TABLE tyres ADD COLUMN warranty_months INT DEFAULT NULL`);
      console.log('✅ Added tyres.warranty_months');
    } else {
      console.log('⏭  tyres.warranty_months already exists, skipping');
    }

    // 2. vendor_payments — was hard-wired to the garages-only `vendors` table via FK,
    // which breaks (or silently mismatches) payments for every other vendor category.
    // Add a category column so rows can be scoped correctly per vendor table, and
    // drop the FK since vendor_id now refers to different tables depending on category.
    if (!(await columnExists(conn, 'vendor_payments', 'vendor_category'))) {
      await conn.query(`ALTER TABLE vendor_payments ADD COLUMN vendor_category VARCHAR(50) DEFAULT NULL`);
      console.log('✅ Added vendor_payments.vendor_category');
      // Backfill: the only rows that exist today were recorded against the garages `vendors` table
      await conn.query(`UPDATE vendor_payments SET vendor_category = 'garages' WHERE vendor_category IS NULL`);
      console.log('✅ Backfilled existing vendor_payments rows as vendor_category = "garages"');
    } else {
      console.log('⏭  vendor_payments.vendor_category already exists, skipping');
    }

    if (await fkExists(conn, 'vendor_payments', 'vendor_payments_ibfk_1')) {
      await conn.query(`ALTER TABLE vendor_payments DROP FOREIGN KEY vendor_payments_ibfk_1`);
      console.log('✅ Dropped vendor_payments_ibfk_1 (vendor_id -> vendors.id) — vendor_id is now cross-category');
    } else {
      console.log('⏭  vendor_payments_ibfk_1 already absent, skipping');
    }

    console.log('✅ Migration complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
