const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicle_inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(50) NOT NULL,
        inventory_item_id INT DEFAULT NULL,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Spare',
        quantity INT NOT NULL DEFAULT 1,
        assigned_date DATE DEFAULT NULL,
        condition_status VARCHAR(50) DEFAULT 'Good',
        source VARCHAR(30) DEFAULT 'manual',
        issue_history_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicle_number (vehicle_number),
        INDEX idx_item (inventory_item_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicle_inventory_returns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_inventory_id INT DEFAULT NULL,
        inventory_item_id INT DEFAULT NULL,
        part_name VARCHAR(255) NOT NULL,
        vehicle_number VARCHAR(50) NOT NULL,
        returned_quantity INT NOT NULL,
        return_date DATE NOT NULL,
        reason VARCHAR(255) DEFAULT NULL,
        remarks TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_vehicle (vehicle_number),
        INDEX idx_inv_item (inventory_item_id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicle_inventory_replacements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(50) NOT NULL,
        old_part VARCHAR(255) NOT NULL,
        new_part VARCHAR(255) NOT NULL,
        old_inventory_item_id INT DEFAULT NULL,
        new_inventory_item_id INT DEFAULT NULL,
        quantity INT NOT NULL DEFAULT 1,
        replace_date DATE NOT NULL,
        reason VARCHAR(255) DEFAULT NULL,
        remarks TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_vehicle (vehicle_number)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicle_inventory_condition_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_inventory_id INT NOT NULL,
        old_condition VARCHAR(50) NOT NULL,
        new_condition VARCHAR(50) NOT NULL,
        remarks TEXT DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_vi (vehicle_inventory_id)
      )
    `);

    console.log('✅ All vehicle_inventory tables created successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
