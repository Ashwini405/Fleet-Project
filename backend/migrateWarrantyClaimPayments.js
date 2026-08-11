const db = require('./config/db');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS warranty_claim_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      claim_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      payment_date DATE NOT NULL,
      notes VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (claim_id) REFERENCES warranty_claims(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ warranty_claim_payments table created');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
