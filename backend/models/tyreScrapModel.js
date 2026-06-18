const db = require('../config/db');

const TyreScrap = {

  create: async (data) => {

    const [result] = await db.query(
      `
      INSERT INTO tyre_scrap_history
      (
        id,
        txn_no,
        tyre_no,
        make,
        model,
        tyre_size,
        vehicle_no,
        running_km,
        remaining_tread,
        vendor_id,
        vendor_name,
        scrap_date,
        sale_amount,
        reason,
        remarks
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.id,
        data.txn_no,
        data.tyre_no,
        data.make,
        data.model,
        data.tyre_size,
        data.vehicle_no,
        data.running_km,
        data.remaining_tread,
        data.vendor_id,
        data.vendor_name,
        data.scrap_date,
        data.sale_amount,
        data.reason,
        data.remarks
      ]
    );

    return result.insertId;
  },

  getAll: async () => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM tyre_scrap_history
      ORDER BY created_at DESC
      `
    );

    return rows;
  }

};

module.exports = TyreScrap;