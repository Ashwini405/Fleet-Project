const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

const COLUMNS = [
  { name: 'vendor_name', def: 'VARCHAR(255) DEFAULT NULL' },
  { name: 'po_number', def: 'VARCHAR(100) DEFAULT NULL' },
  { name: 'return_reason', def: 'VARCHAR(100) DEFAULT NULL' },
  { name: 'credit_amount', def: 'DECIMAL(12,2) NOT NULL DEFAULT 0' },
  { name: 'return_status', def: "VARCHAR(50) NOT NULL DEFAULT 'Pending Pickup'" },
];

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS part_returns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_issue_id INT DEFAULT NULL,
        part_id INT NOT NULL,
        vehicle_number VARCHAR(100) DEFAULT NULL,
        quantity_returned INT NOT NULL,
        return_date DATE NOT NULL,
        condition_on_return ENUM('Good','Average','Damaged') NOT NULL DEFAULT 'Good',
        restocked TINYINT(1) NOT NULL DEFAULT 0,
        notes TEXT,
        created_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_part (part_id),
        INDEX idx_vehicle (vehicle_number),
        INDEX idx_issue (original_issue_id)
      )
    `);

    const [existingRows] = await conn.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'part_returns'
    `);
    const existing = new Set(existingRows.map(row => row.COLUMN_NAME));
    for (const column of COLUMNS) {
      if (!existing.has(column.name)) {
        await conn.query(`ALTER TABLE part_returns ADD COLUMN ${column.name} ${column.def}`);
      }
    }

    await conn.query(`
      UPDATE part_returns
      SET return_status = CASE WHEN restocked = 1 THEN 'Completed' ELSE 'Pending Pickup' END
      WHERE return_status IS NULL OR return_status = ''
    `);

    const [returns] = await conn.query(`
      SELECT r.id, r.part_id, r.quantity_returned, r.po_number, r.credit_amount,
             p.cost_price
      FROM part_returns r
      LEFT JOIN inventory_parts p ON p.id = r.part_id
      WHERE COALESCE(r.credit_amount, 0) = 0 AND r.po_number IS NOT NULL
    `);
    for (const record of returns) {
      const [poRows] = await conn.query(
        `SELECT total_amount, quantity, items FROM inventory_purchase_orders WHERE po_number = ? LIMIT 1`,
        [record.po_number]
      );
      const po = poRows[0];
      const items = po && typeof po.items === 'string' ? JSON.parse(po.items || '[]') : po?.items || [];
      let unitCost = Number(record.cost_price || 0) || Number(items[0]?.unitPrice || items[0]?.unit_price || 0);
      if (unitCost <= 0 && po?.quantity) unitCost = Number(po.total_amount || 0) / Number(po.quantity);
      if (unitCost > 0) {
        await conn.query(
          `UPDATE part_returns SET credit_amount = ? WHERE id = ?`,
          [unitCost * Number(record.quantity_returned || 0), record.id]
        );
      }
    }

    const [zeroCostParts] = await conn.query(`
      SELECT r.id, r.part_id, r.quantity_returned, r.po_number,
             p.cost_price
      FROM part_returns r
      LEFT JOIN inventory_parts p ON p.id = r.part_id
      WHERE COALESCE(r.credit_amount, 0) = 0 AND r.po_number IS NOT NULL
    `);
    for (const record of zeroCostParts) {
      const [poRows] = await conn.query(
        `SELECT total_amount, quantity, items FROM inventory_purchase_orders WHERE po_number = ? LIMIT 1`,
        [record.po_number]
      );
      const po = poRows[0];
      const items = po && typeof po.items === 'string' ? JSON.parse(po.items || '[]') : po?.items || [];
      let unitCost = Number(record.cost_price || 0) || Number(items[0]?.unitPrice || items[0]?.unit_price || 0);
      if (unitCost <= 0 && po?.quantity) unitCost = Number(po.total_amount || 0) / Number(po.quantity);
      if (unitCost > 0) {
        await conn.query(`UPDATE part_returns SET credit_amount = ? WHERE id = ?`, [unitCost * Number(record.quantity_returned || 0), record.id]);
      }
    }

    console.log('✅ part_returns table created successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
