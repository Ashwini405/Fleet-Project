require('dotenv').config();
const db = require('./config/db');

async function addColumn(table) {
  const [columns] = await db.query(`SHOW COLUMNS FROM ${table} LIKE 'garage_id'`);
  if (columns.length === 0) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN garage_id INT NULL AFTER vehicle_id`);
    await db.query(`ALTER TABLE ${table} ADD INDEX idx_${table}_garage_id (garage_id)`);
    console.log(`Added garage_id to ${table}`);
  }
}

async function backfillGarageIds() {
  await db.query(`
    UPDATE vehicle_services vs
    INNER JOIN vendors g ON g.category = 'garages' AND g.garage_name = vs.mechanic
    SET vs.garage_id = g.id
    WHERE vs.garage_id IS NULL
  `);
  await db.query(`
    UPDATE repair_services rs
    INNER JOIN vendors g ON g.category = 'garages' AND g.garage_name = rs.garage
    SET rs.garage_id = g.id
    WHERE rs.garage_id IS NULL
  `);
}

(async () => {
  try {
    await addColumn('vehicle_services');
    await addColumn('repair_services');
    await backfillGarageIds();
    console.log('Service garage links are ready');
  } catch (error) {
    console.error('SERVICE GARAGE LINK MIGRATION ERROR:', error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
