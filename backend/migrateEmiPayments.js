const db = require('./config/db');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vehicle_emi_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vehicle_id INT NOT NULL,
      paid_date DATE NOT NULL,
      note VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ vehicle_emi_payments table created');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
