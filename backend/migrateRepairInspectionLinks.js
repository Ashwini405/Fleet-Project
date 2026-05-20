const db = require('./config/db');

async function addColumnIfMissing(columnName, definition) {
  const [rows] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'repair_services'
        AND COLUMN_NAME = ?
    `,
    [columnName]
  );

  if (rows.length === 0) {
    await db.query(`ALTER TABLE repair_services ADD COLUMN ${columnName} ${definition}`);
    console.log(`Column '${columnName}' added to repair_services.`);
  } else {
    console.log(`Column '${columnName}' already exists on repair_services.`);
  }
}

async function migrate() {
  try {
    await addColumnIfMissing('inspection_id', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfMissing('inspection_defect_id', 'INT DEFAULT NULL');
    await addColumnIfMissing('completed_date', 'DATETIME DEFAULT NULL');
    console.log('Repair inspection link migration completed successfully.');
  } catch (error) {
    console.error('Error migrating repair inspection links:', error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

migrate();
