const db = require("../config/db");

const TyreRetreading = {

  create: async (data) => {

    const [result] = await db.query(
      `
      INSERT INTO tyre_retreading
      (
        tyre_id,
        tyre_no,
        brand,
        model,
        tyre_size,
        vehicle_no,
        last_position,
        running_km,
        remaining_tread,
        vendor_id,
        vendor_name,
        sent_date,
        expected_return_date,
        expected_cost,
        actual_cost,
        return_date,
        new_tread_percent,
        tyre_condition,
        notes,
        status
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.tyre_id,
        data.tyre_no,
        data.brand,
        data.model,
        data.tyre_size,
        data.vehicle_no,
        data.last_position,
        data.running_km,
        data.remaining_tread,
        data.vendor_id,
        data.vendor_name,
        data.sent_date,
        data.expected_return_date,
        data.expected_cost,
        data.actual_cost,
        data.return_date,
        data.new_tread_percent,
        data.tyre_condition,
        data.notes,
        data.status
      ]
    );

    return result.insertId;
  },

  getAll: async () => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM tyre_retreading
      ORDER BY created_at DESC
      `
    );

    return rows;
  },

  // Marks a retreading job returned/cancelled/rejected — this is what makes
  // completion actually stick (it never persisted before, so actual_cost and
  // status only lived in frontend state and reverted on refresh).
  update: async (id, data) => {

    const [result] = await db.query(
      `
      UPDATE tyre_retreading
      SET
        status = COALESCE(?, status),
        actual_cost = COALESCE(?, actual_cost),
        return_date = COALESCE(?, return_date),
        new_tread_percent = COALESCE(?, new_tread_percent),
        tyre_condition = COALESCE(?, tyre_condition),
        notes = COALESCE(?, notes)
      WHERE id = ?
      `,
      [
        data.status ?? null,
        data.actual_cost ?? null,
        data.return_date ?? null,
        data.new_tread_percent ?? null,
        data.tyre_condition ?? null,
        data.notes ?? null,
        id
      ]
    );

    // Keep old_tyres in sync with the outcome — without this, Old Tyres Stock
    // keeps showing "RETREADING / At Vendor" forever regardless of how the
    // job actually ended, since nothing else ever writes back to that table.
    if (data.status && ['RETURNED', 'REJECTED', 'CANCELLED'].includes(data.status)) {
      const [rows] = await db.query(
        `SELECT tyre_no, new_tread_percent FROM tyre_retreading WHERE id = ?`,
        [id]
      );
      const tyreNo = rows[0]?.tyre_no;

      if (tyreNo) {
        if (data.status === 'RETURNED') {
          await db.query(
            `UPDATE old_tyres
             SET tyre_status = 'REUSABLE', store_location = 'Reusable Storage',
                 remaining_tread_percent = COALESCE(?, remaining_tread_percent)
             WHERE old_tyre_number = ?`,
            [rows[0]?.new_tread_percent ?? null, tyreNo]
          );
        } else {
          // REJECTED or CANCELLED — the tyre never actually got retreaded,
          // so it goes back to the general old-stock bucket, actionable again.
          await db.query(
            `UPDATE old_tyres
             SET tyre_status = 'OLD_STOCK', store_location = 'Warehouse Stock'
             WHERE old_tyre_number = ?`,
            [tyreNo]
          );
        }
      }
    }

    return result;
  }

};

module.exports = TyreRetreading;