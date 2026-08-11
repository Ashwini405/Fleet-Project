const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS part_returns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_issue_id INT DEFAULT NULL,
        part_id INT NOT NULL,
        vehicle_number VARCHAR(100) DEFAULT NULL,
        quantity_returned INT NOT NULL,
        return_date DATE NOT NULL,
        condition_on_return ENUM('Good','Average','Damaged') NOT NULL DEFAULT 'Good',
        restocked TINYINT(1) NOT NULL DEFAULT 0,
        notes TEXT,
        created_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_part (part_id),
        INDEX idx_vehicle (vehicle_number),
        INDEX idx_issue (original_issue_id)
      )
    `);

    console.log('✅ part_returns table created successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
