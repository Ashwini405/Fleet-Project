const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS truck_inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        part_name VARCHAR(150) NOT NULL,
        category ENUM('Tools','Spare','Tubes','Flaps') NOT NULL DEFAULT 'Tools',
        quantity INT NOT NULL DEFAULT 1,
        assigned_date DATE DEFAULT NULL,
        \`condition\` ENUM('Good','Average','Poor') NOT NULL DEFAULT 'Good',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicle (vehicle_id)
      )
    `);

    console.log('✅ truck_inventory table created successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
