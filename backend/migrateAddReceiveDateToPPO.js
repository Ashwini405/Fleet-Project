const db = require('./config/db');

async function addColumnIfMissing(table, column, definition) {
  const [cols] = await db.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
  if (cols.length === 0) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✅ ${column} column added to ${table}`);
  } else {
    console.log(`ℹ️  ${column} already exists`);
  }
}

async function migrate() {
  try {
    await addColumnIfMissing('pending_purchase_orders', 'receive_date', 'DATE NULL');
    await addColumnIfMissing('pending_purchase_orders', 'notes', 'TEXT NULL');
    console.log('🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
