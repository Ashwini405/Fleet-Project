const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS fastag_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        fastag_id VARCHAR(100) DEFAULT NULL,
        bank_issuer VARCHAR(150) DEFAULT NULL,
        linked_account_no VARCHAR(100) DEFAULT NULL,
        balance DECIMAL(10,2) NOT NULL DEFAULT 0,
        low_balance_threshold DECIMAL(10,2) NOT NULL DEFAULT 200,
        status ENUM('Active','Inactive','Blacklisted') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_vehicle (vehicle_id)
      )
    `);
    console.log('✅ fastag_accounts table ready');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fastag_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fastag_account_id INT NOT NULL,
        type ENUM('recharge','toll_deduction') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        toll_plaza_name VARCHAR(150) DEFAULT NULL,
        balance_after DECIMAL(10,2) NOT NULL,
        reference_no VARCHAR(150) DEFAULT NULL,
        proof_upload VARCHAR(255) DEFAULT NULL,
        created_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_account (fastag_account_id),
        CONSTRAINT fk_fastag_txn_account FOREIGN KEY (fastag_account_id) REFERENCES fastag_accounts(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ fastag_transactions table ready');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fastag_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fastag_account_id INT DEFAULT NULL,
        vehicle_no VARCHAR(50) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        severity ENUM('Low','Medium','High','Critical') DEFAULT 'High',
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ fastag_notifications table ready');

    await conn.query(`
      ALTER TABLE fastag_transactions
      MODIFY COLUMN type ENUM('recharge','toll_deduction','fuel_monthly') NOT NULL
    `);
    console.log('✅ fastag_transactions monthly fuel type ready');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fastag_monthly_postings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fastag_account_id INT NOT NULL,
        month DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_fastag_month (fastag_account_id, month),
        CONSTRAINT fk_monthly_posting_account FOREIGN KEY (fastag_account_id) REFERENCES fastag_accounts(id) ON DELETE CASCADE,
        CONSTRAINT fk_monthly_posting_transaction FOREIGN KEY (transaction_id) REFERENCES fastag_transactions(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ fastag_monthly_postings table ready');

    console.log('✅ Fastag migration complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
