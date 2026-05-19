const db = require('./config/db');

const COLUMNS = [
  { name: 'status_id',        def: 'TINYINT NOT NULL DEFAULT 0' },
  { name: 'approver_name',    def: 'VARCHAR(100) NULL' },
  { name: 'approval_comment', def: 'TEXT NULL' },
  { name: 'approval_date',    def: 'DATE NULL' },
  { name: 'ordered_at',       def: 'DATE NULL' },
  { name: 'requested_by',     def: 'VARCHAR(100) NULL' },
  { name: 'requested_date',   def: 'DATE NULL' },
];

async function migrate() {
  try {
    // Get existing columns
    const [rows] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'inventory_purchase_orders'
    `);
    const existing = new Set(rows.map(r => r.COLUMN_NAME));

    for (const col of COLUMNS) {
      if (existing.has(col.name)) {
        console.log(`⏭  ${col.name} already exists, skipping`);
        continue;
      }
      await db.query(
        `ALTER TABLE inventory_purchase_orders ADD COLUMN ${col.name} ${col.def}`
      );
      console.log(`✅ Added column: ${col.name}`);
    }

    // Back-fill status_id from existing status text column
    await db.query(`
      UPDATE inventory_purchase_orders
      SET status_id = CASE status
        WHEN 'Pending Approval' THEN 0
        WHEN 'Pending'          THEN 0
        WHEN 'Approved'         THEN 1
        WHEN 'Rejected'         THEN 2
        WHEN 'Ordered'          THEN 3
        WHEN 'Received'         THEN 4
        ELSE 0
      END
    `);
    console.log('✅ status_id back-filled from status column');
    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
