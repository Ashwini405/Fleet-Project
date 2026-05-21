
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS batteries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_number VARCHAR(100) NOT NULL UNIQUE,
        barcode VARCHAR(100),
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        capacity_ah DECIMAL(8,2),
        voltage DECIMAL(5,2),
        battery_type ENUM('Dry','Wet','Lithium','AGM','Gel') DEFAULT 'Dry',
        purchase_date DATE,
        warranty_period_months INT,
        warranty_expiry DATE,
        vendor VARCHAR(150),
        purchase_cost DECIMAL(10,2) DEFAULT 0,
        status ENUM('In Stock','Installed','Weak','Failed','Warranty Claim','Scrap','Return Vendor','Store') DEFAULT 'In Stock',
        location VARCHAR(150) DEFAULT NULL,
        vehicle_id INT DEFAULT NULL,
        compatible_vehicle_types TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_vehicle (vehicle_id),
        INDEX idx_warranty (warranty_expiry)
      )
    `);

    await conn.query(`
      ALTER TABLE batteries MODIFY COLUMN status ENUM('In Stock','Installed','Weak','Failed','Warranty Claim','Scrap','Return Vendor','Store') DEFAULT 'In Stock';
    `);

    await conn.query(`
      ALTER TABLE batteries MODIFY COLUMN location VARCHAR(150) DEFAULT NULL;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS battery_installations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        battery_id INT NOT NULL,
        vehicle_id INT NOT NULL,
        install_date DATE NOT NULL,
        install_odometer INT DEFAULT 0,
        technician VARCHAR(150),
        notes TEXT,
        removed_date DATE DEFAULT NULL,
        removal_odometer INT DEFAULT NULL,
        failure_reason VARCHAR(255) DEFAULT NULL,
        warranty_claim TINYINT(1) DEFAULT 0,
        old_battery_decision ENUM('Scrap','Warranty Claim','Return Vendor','Store') DEFAULT 'Scrap',
        running_km INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_vehicle (vehicle_id),
        INDEX idx_battery (battery_id),
        INDEX idx_active (vehicle_id, removed_date)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS battery_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        battery_id INT NOT NULL,
        vehicle_id INT,
        event_type ENUM('Installed','Removed','Status Changed','Warranty Claimed') NOT NULL,
        event_date DATE NOT NULL,
        odometer INT DEFAULT 0,
        technician VARCHAR(150),
        failure_reason VARCHAR(255),
        warranty_claim TINYINT(1) DEFAULT 0,
        running_km INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_battery (battery_id),
        INDEX idx_vehicle (vehicle_id)
      )
    `);

    console.log('✅ Battery tables created successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
