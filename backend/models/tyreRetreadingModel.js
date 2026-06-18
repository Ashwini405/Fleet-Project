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
  }

};

module.exports = TyreRetreading;