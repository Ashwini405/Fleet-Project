const db = require('./config/db');

const COLUMNS = [
  { name: 'item_name',        def: 'VARCHAR(255) NULL' },
  { name: 'quantity',         def: 'INT NULL' },
  { name: 'category',         def: "VARCHAR(150) NULL DEFAULT 'Others'" },
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

    const [orders] = await db.query(`SELECT id, po_number FROM inventory_purchase_orders ORDER BY id ASC`);
    for (const order of orders) {
      const serialNumber = `PO-${String(order.id).padStart(6, '0')}`;
      if (order.po_number === serialNumber) continue;
      await db.query(`UPDATE part_returns SET po_number = ? WHERE po_number = ?`, [serialNumber, order.po_number]);
      await db.query(`UPDATE inventory_purchase_orders SET po_number = ? WHERE id = ?`, [serialNumber, order.id]);
    }
    console.log('✅ PO numbers normalized to sequential serials');
    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
