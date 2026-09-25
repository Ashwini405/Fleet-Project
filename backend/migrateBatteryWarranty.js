const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM warranties LIKE 'battery_id'`);
    if (!columns.length) {
      await db.query(`ALTER TABLE warranties ADD COLUMN battery_id INT NULL AFTER serial_no`);
      await db.query(`ALTER TABLE warranties ADD INDEX idx_warranties_battery_id (battery_id)`);
      console.log('Added warranties.battery_id');
    } else {
      console.log('warranties.battery_id already exists');
    }
  } catch (error) {
    console.error('Battery warranty migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

migrate();