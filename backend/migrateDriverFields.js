const db = require('./config/db');

async function columnExists(table, column) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function run() {
  if (!(await columnExists('drivers', 'license_no'))) {
    await db.query(`ALTER TABLE drivers ADD COLUMN license_no VARCHAR(100) DEFAULT NULL AFTER id_card_number`);
    console.log('Added drivers.license_no');
  } else {
    console.log('drivers.license_no already exists');
  }

  if (!(await columnExists('drivers', 'joining_date'))) {
    await db.query(`ALTER TABLE drivers ADD COLUMN joining_date DATE DEFAULT NULL AFTER license_no`);
    console.log('Added drivers.joining_date');
  } else {
    console.log('drivers.joining_date already exists');
  }

  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
