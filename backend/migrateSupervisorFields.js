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
  if (!(await columnExists('supervisors', 'supervisor_code'))) {
    await db.query(`ALTER TABLE supervisors ADD COLUMN supervisor_code VARCHAR(50) DEFAULT NULL AFTER id`);
    console.log('Added supervisors.supervisor_code');
  } else {
    console.log('supervisors.supervisor_code already exists');
  }

  if (!(await columnExists('supervisors', 'notes'))) {
    await db.query(`ALTER TABLE supervisors ADD COLUMN notes TEXT DEFAULT NULL`);
    console.log('Added supervisors.notes');
  } else {
    console.log('supervisors.notes already exists');
  }

  if (!(await columnExists('supervisors', 'wallet_balance'))) {
    await db.query(`ALTER TABLE supervisors ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00`);
    console.log('Added supervisors.wallet_balance');
  } else {
    console.log('supervisors.wallet_balance already exists');
  }

  // Backfill a code for any existing supervisors that don't have one yet
  const [rows] = await db.query(
    `SELECT id FROM supervisors WHERE supervisor_code IS NULL OR supervisor_code = '' ORDER BY id`
  );
  for (const row of rows) {
    const code = `SUP-${String(row.id).padStart(4, '0')}`;
    await db.query(`UPDATE supervisors SET supervisor_code = ? WHERE id = ?`, [code, row.id]);
  }
  console.log(`Backfilled supervisor_code for ${rows.length} existing row(s)`);

  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
