const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS tenders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tender_title VARCHAR(255) NOT NULL,
        tender_ref_no VARCHAR(150) DEFAULT NULL,
        issuing_authority VARCHAR(255) DEFAULT NULL,
        plant_id INT DEFAULT NULL,
        plant_name VARCHAR(255) DEFAULT NULL,
        submission_deadline DATE DEFAULT NULL,
        tender_status ENUM('Draft','Submitted','Awarded','Rejected','Closed') NOT NULL DEFAULT 'Draft',
        quoted_price DECIMAL(14,2) DEFAULT NULL,
        awarded_price DECIMAL(14,2) DEFAULT NULL,
        document_upload VARCHAR(255) DEFAULT NULL,
        notes TEXT,
        created_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (tender_status),
        INDEX idx_plant (plant_id)
      )
    `);

    console.log('✅ tenders table ready');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
