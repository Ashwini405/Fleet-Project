const db = require('./config/db');

async function migrate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS tyre_service_history (
        id                    INT AUTO_INCREMENT PRIMARY KEY,
        repair_id             INT NULL,
        vehicle_id            INT NOT NULL,
        vehicle_no            VARCHAR(50),
        axle_position         VARCHAR(30),
        tyre_number           VARCHAR(50),
        issue_type            VARCHAR(50),
        action_taken          VARCHAR(50),
        tyre_health           VARCHAR(20),
        tread_percent         DECIMAL(5,2) DEFAULT 0,
        running_km            INT DEFAULT 0,
        replacement_tyre_number VARCHAR(50) NULL,
        replacement_source    VARCHAR(20) NULL,
        tyre_repair_cost      DECIMAL(10,2) DEFAULT 0,
        tyre_replacement_cost DECIMAL(10,2) DEFAULT 0,
        retreading_cost       DECIMAL(10,2) DEFAULT 0,
        service_date          DATE,
        created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ tyre_service_history table ready");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
