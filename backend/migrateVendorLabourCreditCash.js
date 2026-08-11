const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

const PAYMENT_TERMS_TABLES = [
  'vendors',
  'oil_vendors',
  'rta_vendors',
  'tyre_vendors',
  'fuel_vendors',
  'parts_vendors',
  'showrooms',
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
    // 1. payment_terms on all existing vendor tables
    for (const table of PAYMENT_TERMS_TABLES) {
      if (!(await columnExists(conn, table, 'payment_terms'))) {
        await conn.query(`ALTER TABLE ${table} ADD COLUMN payment_terms ENUM('credit','cash') NOT NULL DEFAULT 'credit'`);
        console.log(`✅ Added ${table}.payment_terms`);
      } else {
        console.log(`⏭  ${table}.payment_terms already exists, skipping`);
      }
    }

    // 2. labour_vendors table (mirrors oil_vendors)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS labour_vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(20),
        email VARCHAR(255),
        address_location TEXT,
        gst_number VARCHAR(100),
        opening_balance DECIMAL(12,2) DEFAULT 0,
        status ENUM('Active','Inactive') DEFAULT 'Active',
        payment_terms ENUM('credit','cash') NOT NULL DEFAULT 'credit',
        bank_name VARCHAR(255),
        custom_bank_name VARCHAR(255),
        account_number VARCHAR(100),
        ifsc_code VARCHAR(50),
        upi_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ labour_vendors table ready');

    console.log('✅ Vendor Labour / Credit-Cash migration complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
