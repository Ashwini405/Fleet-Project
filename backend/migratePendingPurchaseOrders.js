const db = require('./config/db');

async function migrate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pending_purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_number VARCHAR(50) UNIQUE,
        category VARCHAR(100),
        item_name VARCHAR(255),
        brand_name VARCHAR(255),
        serial_number VARCHAR(255),
        ordered_quantity INT NOT NULL,
        received_quantity INT DEFAULT 0,
        pending_quantity INT NOT NULL,
        status ENUM('Pending','Partially Received','Completed') DEFAULT 'Pending',
        receive_date DATE NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ pending_purchase_orders table ready');
    console.log('🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
