const db = require("../config/db");

const TruckInventory = {

  getByVehicle: async (vehicleId) => {
    const [manualRows] = await db.query(
      `SELECT * FROM truck_inventory WHERE vehicle_id = ? ORDER BY created_at DESC`,
      [vehicleId]
    );

    const [vehicleRows] = await db.query(
      `SELECT vehicle_no FROM vehicles WHERE id = ? LIMIT 1`,
      [vehicleId]
    );

    const vehicleNo = vehicleRows?.[0]?.vehicle_no;
    const merged = [...manualRows];

    if (!vehicleNo) {
      return merged;
    }

    const [issueRows] = await db.query(
      `SELECT
        h.id AS issue_id,
        p.part_name,
        COALESCE(p.category, 'Spare') AS category,
        h.quantity,
        h.issue_date AS assigned_date,
        'Good' AS issue_condition,
        h.created_at
       FROM inventory_issue_history h
       LEFT JOIN inventory_parts p ON p.id = h.part_id
       WHERE TRIM(LOWER(COALESCE(h.vehicle_number, ''))) = TRIM(LOWER(?))
         AND (h.status IS NULL OR h.status = 'Issued')
       ORDER BY h.issue_date DESC, h.created_at DESC`,
      [String(vehicleNo)]
    );

    const seen = new Set(
      manualRows.map(item => `manual-${item.id}`)
    );

    issueRows.forEach((item) => {
      const key = `issue-${item.issue_id}`;
      if (seen.has(key)) return;

      merged.push({
        id: key,
        vehicle_id: Number(vehicleId),
        part_name: item.part_name || 'Unknown Item',
        category: item.category || 'Spare',
        quantity: Number(item.quantity || 0),
        assigned_date: item.assigned_date,
        condition: item.issue_condition || 'Good',
        created_at: item.created_at,
        source: 'issue_history',
      });
      seen.add(key);
    });

    return merged.sort((a, b) => new Date(b.assigned_date || b.created_at || 0) - new Date(a.assigned_date || a.created_at || 0));
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO truck_inventory (vehicle_id, part_name, category, quantity, assigned_date, \`condition\`)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.vehicle_id,
        data.part_name,
        data.category,
        data.quantity,
        data.assigned_date || null,
        data.condition,
      ]
    );
    return result;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM truck_inventory WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE truck_inventory SET
        part_name = ?,
        category = ?,
        quantity = ?,
        assigned_date = ?,
        \`condition\` = ?
       WHERE id = ?`,
      [
        data.part_name,
        data.category,
        data.quantity,
        data.assigned_date || null,
        data.condition,
        id,
      ]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM truck_inventory WHERE id = ?`,
      [id]
    );
    return result;
  },

};

module.exports = TruckInventory;
