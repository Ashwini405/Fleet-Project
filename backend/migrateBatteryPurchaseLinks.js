const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function addPurchase(conn, { vendor, itemName, quantity, unitPrice, serial, date, source }) {
  const [existing] = await conn.query(
    `SELECT id FROM inventory_purchase_orders
     WHERE category = 'Batteries'
       AND LOWER(TRIM(vendor)) = LOWER(TRIM(?))
       AND items LIKE ?
     LIMIT 1`,
    [vendor, `%${serial}%`]
  );
  if (existing.length) return;

  const [result] = await conn.query(
    `INSERT INTO inventory_purchase_orders
      (po_number, vendor, item_name, quantity, category, total_amount, status, status_id, items, requested_by, requested_date)
     VALUES (NULL, ?, ?, ?, 'Batteries', ?, 'Received', 4, ?, 'Battery Migration', ?)`,
    [
      vendor,
      itemName,
      quantity,
      quantity * unitPrice,
      JSON.stringify([{ partName: itemName, qty: quantity, unitPrice, battery_serial: serial, source }]),
      date || new Date().toISOString().slice(0, 10),
    ]
  );
  await conn.query(
    `UPDATE inventory_purchase_orders SET po_number = ? WHERE id = ?`,
    [`BAT-${String(result.insertId).padStart(6, '0')}`, result.insertId]
  );
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [receivedPOs] = await conn.query(
      `SELECT * FROM inventory_purchase_orders
       WHERE status_id = 4 AND LOWER(TRIM(category)) IN ('battery', 'batteries')`
    );
    for (const po of receivedPOs) {
      const items = typeof po.items === 'string' ? JSON.parse(po.items || '[]') : (po.items || []);
      const item = items[0] || {};
      const quantity = Math.max(0, Number(item.qty ?? item.quantity ?? po.quantity ?? 0));
      const unitPrice = Number(item.unitPrice ?? item.unit_price ?? (Number(po.total_amount || 0) / Math.max(quantity, 1)));
      const itemName = item.partName || item.name || po.item_name || 'Truck Battery';

      for (let index = 0; index < quantity; index += 1) {
        const serial = item.battery_serial || `PO-${po.po_number}-${String(index + 1).padStart(3, '0')}`;
        const [existingBattery] = await conn.query(
          `SELECT id FROM batteries WHERE serial_number = ? LIMIT 1`,
          [serial]
        );
        if (!existingBattery.length) {
          await conn.query(
            `INSERT INTO batteries
              (serial_number, brand, model, purchase_date, vendor, purchase_cost, status, location, notes)
             VALUES (?, 'Unknown', ?, ?, ?, ?, 'In Stock', 'Warehouse', ?)`,
            [serial, itemName, po.requested_date || new Date().toISOString().slice(0, 10), po.vendor || null, unitPrice, `Backfilled from ${po.po_number}`]
          );
        }
      }
    }

    const [batteries] = await conn.query(
      `SELECT id, serial_number, brand, model, purchase_date, vendor, purchase_cost
       FROM batteries
       WHERE vendor IS NOT NULL AND TRIM(vendor) <> '' AND purchase_cost > 0`
    );
    for (const battery of batteries) {
      await addPurchase(conn, {
        vendor: battery.vendor,
        itemName: `${battery.brand || 'Battery'} ${battery.model || ''}`.trim(),
        quantity: 1,
        unitPrice: Number(battery.purchase_cost),
        serial: battery.serial_number,
        date: battery.purchase_date,
        source: 'Battery Inventory',
      });
    }

    await conn.commit();
    console.log('Battery purchase links backfilled successfully');
  } catch (error) {
    await conn.rollback();
    console.error('Battery purchase link migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await db.end();
  }
}

migrate();
