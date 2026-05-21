const db = require('./config/db');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS tyre_notifications (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      notification_id VARCHAR(40)  NOT NULL UNIQUE,
      vehicle_number  VARCHAR(50),
      tyre_id         VARCHAR(60),
      axle_position   VARCHAR(30),
      incident_type   VARCHAR(60)  NOT NULL,
      severity        ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
      priority        ENUM('Low','Normal','High','Urgent')   NOT NULL DEFAULT 'Normal',
      message         TEXT         NOT NULL,
      status          ENUM('Unread','Read') NOT NULL DEFAULT 'Unread',
      created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('tyre_notifications table ready');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
