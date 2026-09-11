const db = require('../config/db');

const VehicleInventory = {

  // ── GET all items for a vehicle (merges vehicle_inventory + issue_history fallback) ──
  getByVehicleNumber: async (vehicleNumber) => {
    // 1. Rows explicitly managed in vehicle_inventory table
    const [viRows] = await db.query(
      `SELECT
        vi.id,
        vi.vehicle_number,
        vi.inventory_item_id,
        vi.item_name,
        vi.category,
        vi.quantity,
        vi.assigned_date,
        vi.condition_status AS condition_status,
        vi.source,
        vi.issue_history_id,
        vi.created_at
       FROM vehicle_inventory vi
       WHERE TRIM(LOWER(vi.vehicle_number)) = TRIM(LOWER(?))
         AND vi.quantity > 0
       ORDER BY vi.assigned_date DESC, vi.created_at DESC`,
      [vehicleNumber]
    );

    // 2. Issued parts not yet synced into vehicle_inventory (existing historical data)
    const syncedIssueIds = new Set(
      viRows.filter(r => r.issue_history_id).map(r => r.issue_history_id)
    );

    const [issueRows] = await db.query(
      `SELECT
        h.id AS issue_history_id,
        h.part_id AS inventory_item_id,
        p.part_name AS item_name,
        COALESCE(p.category, 'Spare') AS category,
        h.quantity,
        h.issue_date AS assigned_date,
        h.created_at
       FROM inventory_issue_history h
       LEFT JOIN inventory_parts p ON p.id = h.part_id
       WHERE TRIM(LOWER(COALESCE(h.vehicle_number, ''))) = TRIM(LOWER(?))
         AND (h.status IS NULL OR h.status IN ('Issued', 'Partially Returned'))
       ORDER BY h.issue_date DESC, h.created_at DESC`,
      [vehicleNumber]
    );

    // Filter out returned rows using part_returns table (works even without status column)
    const [returnedIds] = await db.query(
      `SELECT DISTINCT original_issue_id
       FROM part_returns
       WHERE original_issue_id IS NOT NULL`
    ).catch(() => [[]]);
    const returnedSet = new Set(returnedIds.map(r => r.original_issue_id));

    const activeIssueRows = issueRows.filter(r => !returnedSet.has(r.issue_history_id));

    // Merge: skip issue rows already represented in vehicle_inventory
    console.log('[VehicleInventory] viRows:', viRows.length, '| issueRows:', issueRows.length, '| activeIssueRows:', activeIssueRows.length);
    const merged = [...viRows];
    for (const row of activeIssueRows) {
      if (syncedIssueIds.has(row.issue_history_id)) continue;
      // Auto-sync into vehicle_inventory so future actions work
      try {
        const [ins] = await db.query(
          `INSERT INTO vehicle_inventory
             (vehicle_number, inventory_item_id, item_name, category, quantity, assigned_date, condition_status, source, issue_history_id)
           VALUES (?, ?, ?, ?, ?, ?, 'Good', 'issued', ?)`,
          [vehicleNumber, row.inventory_item_id, row.item_name, row.category, row.quantity, row.assigned_date, row.issue_history_id]
        );
        merged.push({
          id: ins.insertId,
          vehicle_number: vehicleNumber,
          inventory_item_id: row.inventory_item_id,
          item_name: row.item_name,
          category: row.category,
          quantity: row.quantity,
          assigned_date: row.assigned_date,
          condition_status: 'Good',
          source: 'issued',
          issue_history_id: row.issue_history_id,
          created_at: row.created_at,
        });
      } catch (_) {
        // duplicate guard — just show it without a real id
        merged.push({
          id: `ih-${row.issue_history_id}`,
          vehicle_number: vehicleNumber,
          inventory_item_id: row.inventory_item_id,
          item_name: row.item_name || 'Unknown Part',
          category: row.category || 'Spare',
          quantity: row.quantity,
          assigned_date: row.assigned_date,
          condition_status: 'Good',
          source: 'issued',
          issue_history_id: row.issue_history_id,
          created_at: row.created_at,
        });
      }
    }

    return merged.sort((a, b) =>
      new Date(b.assigned_date || b.created_at || 0) - new Date(a.assigned_date || a.created_at || 0)
    );
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM vehicle_inventory WHERE id = ?`, [id]
    );
    return rows[0] || null;
  },

  // ── RETURN PART ──────────────────────────────────────────────────────────────
  returnPart: async ({ id, returnQty, returnDate, reason, remarks, conditionOnReturn }) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        `SELECT * FROM vehicle_inventory WHERE id = ?`, [id]
      );
      if (!rows.length) throw new Error('Vehicle inventory item not found');
      const item = rows[0];

      if (returnQty > item.quantity) throw new Error('Return quantity exceeds assigned quantity');

      const newQty = item.quantity - returnQty;

      // Update or remove vehicle_inventory row
      if (newQty === 0) {
        await conn.query(`DELETE FROM vehicle_inventory WHERE id = ?`, [id]);
      } else {
        await conn.query(
          `UPDATE vehicle_inventory SET quantity = ?, updated_at = NOW() WHERE id = ?`,
          [newQty, id]
        );
      }

      // Increase central inventory stock
      if (item.inventory_item_id) {
        await conn.query(
          `UPDATE inventory_parts
           SET current_stock = current_stock + ?,
               inventory_value = (current_stock + ?) * COALESCE(cost_price, 0),
               updated_at = NOW()
           WHERE id = ?`,
          [returnQty, returnQty, item.inventory_item_id]
        );

        // Stock movement record
        await conn.query(
          `INSERT INTO inventory_stock_movements (part_id, movement_type, quantity, movement_date)
           VALUES (?, 'Stock In', ?, ?)`,
          [item.inventory_item_id, returnQty, returnDate || new Date()]
        );
      }

      // Update issue history status
      if (item.issue_history_id) {
        const status = newQty === 0 ? 'Returned' : 'Partially Returned';
        await conn.query(
          `UPDATE inventory_issue_history SET status = ? WHERE id = ?`,
          [status, item.issue_history_id]
        );
      }

      // Return history record
      const [result] = await conn.query(
        `INSERT INTO vehicle_inventory_returns
           (vehicle_inventory_id, inventory_item_id, part_name, vehicle_number, returned_quantity, return_date, reason, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, item.inventory_item_id, item.item_name, item.vehicle_number, returnQty, returnDate, reason || null, remarks || null]
      );

      // Keep the shared Parts > Returns ledger in sync with truck inventory.
      await conn.query(
        `INSERT INTO part_returns
           (original_issue_id, part_id, vehicle_number, quantity_returned, return_date, condition_on_return, restocked, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          item.issue_history_id || null,
          item.inventory_item_id,
          item.vehicle_number,
          returnQty,
          returnDate,
          conditionOnReturn || item.condition_status || 'Good',
          remarks || reason || null,
          'Admin',
        ]
      );

      await conn.commit();
      return { returnId: result.insertId, remainingQty: newQty };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── REPLACE PART ─────────────────────────────────────────────────────────────
  replacePart: async ({ id, newInventoryItemId, newItemName, newCategory, quantity, replaceDate, reason, remarks }) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        `SELECT * FROM vehicle_inventory WHERE id = ?`, [id]
      );
      if (!rows.length) throw new Error('Vehicle inventory item not found');
      const oldItem = rows[0];

      // Validate new part stock
      if (newInventoryItemId) {
        const [newParts] = await conn.query(
          `SELECT current_stock FROM inventory_parts WHERE id = ?`, [newInventoryItemId]
        );
        if (!newParts.length) throw new Error('New inventory part not found');
        if (newParts[0].current_stock < quantity) throw new Error('Insufficient stock for new part');
      }

      // Return old part to inventory
      if (oldItem.inventory_item_id) {
        await conn.query(
          `UPDATE inventory_parts
           SET current_stock = current_stock + ?,
               updated_at = NOW()
           WHERE id = ?`,
          [oldItem.quantity, oldItem.inventory_item_id]
        );
        await conn.query(
          `INSERT INTO inventory_stock_movements (part_id, movement_type, quantity, movement_date)
           VALUES (?, 'Stock In', ?, ?)`,
          [oldItem.inventory_item_id, oldItem.quantity, replaceDate || new Date()]
        );
      }

      // Mark old issue history as Returned
      if (oldItem.issue_history_id) {
        await conn.query(
          `UPDATE inventory_issue_history SET status = 'Returned' WHERE id = ?`,
          [oldItem.issue_history_id]
        );
      }

      // Issue new part from inventory
      if (newInventoryItemId) {
        await conn.query(
          `UPDATE inventory_parts
           SET current_stock = current_stock - ?,
               updated_at = NOW()
           WHERE id = ?`,
          [quantity, newInventoryItemId]
        );
        await conn.query(
          `INSERT INTO inventory_stock_movements (part_id, movement_type, quantity, movement_date)
           VALUES (?, 'Stock Out', ?, ?)`,
          [newInventoryItemId, quantity, replaceDate || new Date()]
        );
      }

      // Update vehicle_inventory row with new part
      await conn.query(
        `UPDATE vehicle_inventory
         SET inventory_item_id = ?,
             item_name = ?,
             category = ?,
             quantity = ?,
             assigned_date = ?,
             condition_status = 'Good',
             issue_history_id = NULL,
             updated_at = NOW()
         WHERE id = ?`,
        [newInventoryItemId || null, newItemName, newCategory || oldItem.category, quantity, replaceDate, id]
      );

      // Replacement history record
      const [result] = await conn.query(
        `INSERT INTO vehicle_inventory_replacements
           (vehicle_number, old_part, new_part, old_inventory_item_id, new_inventory_item_id, quantity, replace_date, reason, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [oldItem.vehicle_number, oldItem.item_name, newItemName, oldItem.inventory_item_id, newInventoryItemId || null, quantity, replaceDate, reason || null, remarks || null]
      );

      // Replacement returns the old part to the same shared returns ledger.
      await conn.query(
        `INSERT INTO part_returns
           (original_issue_id, part_id, vehicle_number, quantity_returned, return_date, condition_on_return, restocked, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          oldItem.issue_history_id || null,
          oldItem.inventory_item_id,
          oldItem.vehicle_number,
          oldItem.quantity,
          replaceDate,
          oldItem.condition_status || 'Good',
          remarks || reason || 'Replaced on vehicle',
          'Admin',
        ]
      );

      await conn.commit();
      return { replacementId: result.insertId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── UPDATE CONDITION ─────────────────────────────────────────────────────────
  updateCondition: async ({ id, newCondition, remarks }) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        `SELECT * FROM vehicle_inventory WHERE id = ?`, [id]
      );
      if (!rows.length) throw new Error('Vehicle inventory item not found');
      const item = rows[0];

      await conn.query(
        `UPDATE vehicle_inventory SET condition_status = ?, updated_at = NOW() WHERE id = ?`,
        [newCondition, id]
      );

      await conn.query(
        `INSERT INTO vehicle_inventory_condition_history
           (vehicle_inventory_id, old_condition, new_condition, remarks)
         VALUES (?, ?, ?, ?)`,
        [id, item.condition_status, newCondition, remarks || null]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── REMOVE ASSIGNMENT ────────────────────────────────────────────────────────
  removeAssignment: async (id) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        `SELECT * FROM vehicle_inventory WHERE id = ?`, [id]
      );
      if (!rows.length) throw new Error('Vehicle inventory item not found');
      const item = rows[0];

      // Restore stock
      if (item.inventory_item_id) {
        await conn.query(
          `UPDATE inventory_parts
           SET current_stock = current_stock + ?,
               updated_at = NOW()
           WHERE id = ?`,
          [item.quantity, item.inventory_item_id]
        );
        await conn.query(
          `INSERT INTO inventory_stock_movements (part_id, movement_type, quantity, movement_date)
           VALUES (?, 'Stock In', ?, NOW())`,
          [item.inventory_item_id, item.quantity]
        );
      }

      // Mark issue history
      if (item.issue_history_id) {
        await conn.query(
          `UPDATE inventory_issue_history SET status = 'Returned' WHERE id = ?`,
          [item.issue_history_id]
        );
      }

      await conn.query(`DELETE FROM vehicle_inventory WHERE id = ?`, [id]);

      await conn.commit();
      return item;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── SYNC: called after Issue Part to create vehicle_inventory row ────────────
  syncFromIssue: async ({ issueHistoryId, vehicleNumber, inventoryItemId, itemName, category, quantity, issueDate }) => {
    const [existing] = await db.query(
      `SELECT id FROM vehicle_inventory
       WHERE issue_history_id = ? AND vehicle_number = ?`,
      [issueHistoryId, vehicleNumber]
    );
    if (existing.length) return existing[0].id;

    const [result] = await db.query(
      `INSERT INTO vehicle_inventory
         (vehicle_number, inventory_item_id, item_name, category, quantity, assigned_date, condition_status, source, issue_history_id)
       VALUES (?, ?, ?, ?, ?, ?, 'Good', 'issued', ?)`,
      [vehicleNumber, inventoryItemId, itemName, category || 'Spare', quantity, issueDate || null, issueHistoryId]
    );
    return result.insertId;
  },

  getInventoryParts: async () => {
    const [rows] = await db.query(
      `SELECT id, part_name, category, current_stock FROM inventory_parts
       WHERE current_stock > 0 ORDER BY part_name ASC`
    );
    return rows;
  },
};

module.exports = VehicleInventory;
