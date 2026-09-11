const db = require('../config/db');

const PendingPurchaseOrder = {

  getAll: async () => {
    const [rows] = await db.query(
      `SELECT * FROM pending_purchase_orders ORDER BY created_at DESC`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM pending_purchase_orders WHERE id = ?`, [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const po_number = `PPO-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [result] = await db.query(
      `INSERT INTO pending_purchase_orders
        (po_number, category, item_name, brand_name, serial_number,
         ordered_quantity, received_quantity, pending_quantity, status)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'Pending')`,
      [
        po_number,
        data.category || null,
        data.item_name,
        data.brand_name || null,
        data.serial_number || null,
        data.quantity,
        data.quantity,
      ]
    );
    return { insertId: result.insertId, po_number };
  },

  receiveStock: async (id, receivedQty, receiveDate, notes) => {
    const [rows] = await db.query(
      `SELECT * FROM pending_purchase_orders WHERE id = ?`, [id]
    );
    if (!rows.length) return null;
    const po = rows[0];

    const newReceived = Number(po.received_quantity) + Number(receivedQty);
    const newPending  = Number(po.ordered_quantity) - newReceived;
    const newStatus   = newPending <= 0 ? 'Completed' : 'Partially Received';

    await db.query(
      `UPDATE pending_purchase_orders
       SET received_quantity = ?, pending_quantity = ?, status = ?,
           receive_date = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [newReceived, Math.max(0, newPending), newStatus, receiveDate || null, notes || null, id]
    );

    return { ...po, received_quantity: newReceived, pending_quantity: Math.max(0, newPending), status: newStatus };
  },

  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM pending_purchase_orders WHERE id = ?`, [id]
    );
    return result;
  },

  getPendingCount: async () => {
    const [[row]] = await db.query(
      `SELECT COUNT(*) AS n FROM pending_purchase_orders WHERE status IN ('Pending','Partially Received')`
    );
    return Number(row.n);
  },
};

module.exports = PendingPurchaseOrder;
