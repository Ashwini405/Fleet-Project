const PPO = require('../models/pendingPurchaseOrderModel');
const db  = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const data = await PPO.getAll();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('PPO GET ALL ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await PPO.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('PPO GET BY ID ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { category, item_name, brand_name, serial_number, quantity } = req.body;
    if (!item_name || !item_name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required.' });
    }
    const result = await PPO.create({ category, item_name: item_name.trim(), brand_name, serial_number, quantity: Number(quantity) });
    res.status(201).json({ success: true, message: 'Pending purchase order created.', id: result.insertId, po_number: result.po_number });
  } catch (err) {
    console.error('PPO CREATE ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, item_name, brand_name, serial_number } = req.body;
    await db.query(
      `UPDATE pending_purchase_orders SET category=?, item_name=?, brand_name=?, serial_number=?, updated_at=NOW() WHERE id=?`,
      [category || null, item_name, brand_name || null, serial_number || null, id]
    );
    res.json({ success: true, message: 'Updated successfully.' });
  } catch (err) {
    console.error('PPO UPDATE ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await PPO.delete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully.' });
  } catch (err) {
    console.error('PPO DELETE ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.receiveStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { received_quantity, receive_date, notes } = req.body;

    if (!received_quantity || Number(received_quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid received quantity is required.' });
    }

    const po = await PPO.getById(id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    if (po.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'This order is already fully received.' });
    }

    const qty = Number(received_quantity);
    if (qty > Number(po.pending_quantity)) {
      return res.status(400).json({ success: false, message: `Cannot receive more than pending quantity (${po.pending_quantity}).` });
    }

    const updated = await PPO.receiveStock(id, qty, receive_date, notes);

    // Update inventory: insert or increment
    const [existing] = await db.query(
      `SELECT id, current_stock, brand FROM inventory_parts WHERE LOWER(part_name) = LOWER(?) LIMIT 1`,
      [po.item_name]
    );

    if (existing.length) {
      await db.query(
        `UPDATE inventory_parts
         SET current_stock = current_stock + ?,
             brand = CASE WHEN brand IS NULL OR TRIM(brand) = '' OR brand = '—' THEN ? ELSE brand END,
             updated_at = NOW()
         WHERE id = ?`,
        [qty, po.brand_name || null, existing[0].id]
      );
      await db.query(
        `INSERT INTO inventory_stock_movements (part_id, movement_type, quantity, movement_date)
         VALUES (?, 'Stock In', ?, ?)`,
        [existing[0].id, qty, receive_date || new Date().toISOString().slice(0, 10)]
      );
    } else {
      const [inserted] = await db.query(
        `INSERT INTO inventory_parts (part_name, category, brand, sku, current_stock, opening_stock, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 'PPO Auto')`,
        [po.item_name, po.category || 'Others', po.brand_name || null, po.serial_number || null, qty, qty]
      );
      await db.query(
        `INSERT INTO inventory_stock_movements (part_id, movement_type, quantity, movement_date)
         VALUES (?, 'Stock In', ?, ?)`,
        [inserted.insertId, qty, receive_date || new Date().toISOString().slice(0, 10)]
      );
    }

    res.json({ success: true, message: 'Stock received and inventory updated.', data: updated });
  } catch (err) {
    console.error('PPO RECEIVE STOCK ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
