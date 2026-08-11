const db = require('./config/db');

async function tableExists(table) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].cnt > 0;
}

async function run() {
  if (!(await tableExists('driver_advances'))) {
    await db.query(`
      CREATE TABLE driver_advances (
        id INT NOT NULL AUTO_INCREMENT,
        driver_id INT NOT NULL,
        advance_date DATE NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        reason VARCHAR(255) DEFAULT NULL,
        status ENUM('outstanding','recovered') DEFAULT 'outstanding',
        settlement_id INT DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY driver_id (driver_id),
        KEY settlement_id (settlement_id),
        CONSTRAINT fk_driver_advance_driver FOREIGN KEY (driver_id) REFERENCES drivers (id),
        CONSTRAINT fk_driver_advance_settlement FOREIGN KEY (settlement_id) REFERENCES driver_settlements (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('Created driver_advances table');
  } else {
    console.log('driver_advances table already exists');
  }

  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
