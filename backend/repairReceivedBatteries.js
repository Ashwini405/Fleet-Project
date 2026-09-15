const db = require('./config/db');

async function repair() {
  const conn = await db.getConnection();
  try {
    const [orders] = await conn.query(`SELECT * FROM inventory_purchase_orders WHERE status_id = 4 OR status = 'Received'`);
    let created = 0;
    for (const po of orders) {
      const items = typeof po.items === 'string' ? JSON.parse(po.items || '[]') : po.items || [];
      const item = items[0] || {};
      if (String(item.category || '').toLowerCase() !== 'batteries') continue;
      const serial = item.part_number || item.partName || item.name;
      const [[existing]] = await conn.query(`SELECT id FROM batteries WHERE serial_number = ? LIMIT 1`, [serial]);
      if (existing) continue;
      const [[request]] = po.inventory_request_id
        ? await conn.query(`SELECT warranty_details FROM inventory_requests WHERE id = ?`, [po.inventory_request_id])
        : [[]];
      const warrantyMatch = String(request?.warranty_details || '').match(/(\d+)\s*months?/i);
      const purchaseDate = po.received_at || po.created_at || new Date();
      const expiry = warrantyMatch
        ? new Date(new Date(purchaseDate).setMonth(new Date(purchaseDate).getMonth() + Number(warrantyMatch[1]))).toISOString().slice(0, 10)
        : null;
      await conn.query(
        `INSERT INTO batteries
         (serial_number, brand, model, purchase_date, warranty_period_months, warranty_expiry,
          vendor, purchase_cost, status, location, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'In Stock', 'Warehouse', ?)`,
        [serial, item.brand_name || item.brand || 'Unknown', item.partName || item.name || 'Battery',
         purchaseDate, warrantyMatch ? Number(warrantyMatch[1]) : null, expiry,
         po.vendor || null, Number(item.unitPrice || po.total_amount || 0), `Backfilled from ${po.po_number}`]
      );
      created++;
    }
    console.log(`Created ${created} received battery record(s).`);
  } finally {
    conn.release();
    await db.end();
  }
}

repair().catch(error => {
  console.error('Received battery repair failed:', error.message);
  process.exitCode = 1;
});
