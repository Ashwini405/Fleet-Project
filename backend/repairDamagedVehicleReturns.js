const db = require('./config/db');

async function repair() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT id, part_id, quantity_returned, return_date
       FROM part_returns
       WHERE LOWER(condition_on_return) = 'damaged'
         AND original_issue_id IS NOT NULL
         AND restocked = 1
       FOR UPDATE`
    );

    for (const row of rows) {
      await conn.query(
        `UPDATE inventory_parts
         SET current_stock = GREATEST(0, current_stock - ?),
             inventory_value = GREATEST(0, current_stock - ?) * COALESCE(cost_price, 0),
             updated_at = NOW()
         WHERE id = ?`,
        [row.quantity_returned, row.quantity_returned, row.part_id]
      );
      await conn.query(
        `INSERT INTO inventory_stock_movements
         (part_id, movement_type, event_type, quantity, movement_date, performed_by)
         VALUES (?, 'Stock Out', 'Damaged Return Correction', ?, ?, 'System')`,
        [row.part_id, row.quantity_returned, row.return_date]
      );
      await conn.query(`UPDATE part_returns SET restocked = 0 WHERE id = ?`, [row.id]);
    }

    await conn.commit();
    console.log(`Repaired ${rows.length} damaged vehicle return(s).`);
  } catch (error) {
    await conn.rollback();
    console.error('Damaged return repair failed:', error.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await db.end();
  }
}

repair();
