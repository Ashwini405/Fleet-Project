const db = require('../config/db');

const Inventory = {

  // ✅ CREATE PART
  create: async (data) => {

    const [result] = await db.query(
      `INSERT INTO inventory_parts (

        vehicle_id,

        part_name,
        sku,
        category,
        description,
        brand,

        opening_stock,
        current_stock,
        min_stock,
        reorder_level,
        unit,

        cost_price,
        selling_price,
        inventory_value,

        vehicle_type,
        compatible_vehicles,
        service_interval,

        preferred_vendor,
        gst_number,
        vendor_contact,

        warehouse,
        rack_no,
        bin_no,

        expiry_date,
        warranty,

        part_image,
        files,

        notes,
        stock_status,

        created_by

      ) VALUES (

        ?, 

        ?, ?, ?, ?, ?,

        ?, ?, ?, ?, ?,

        ?, ?, ?,

        ?, ?, ?,

        ?, ?, ?,

        ?, ?, ?,

        ?, ?,

        ?, ?,

        ?, ?,

        ?

      )`,
      [
        data.vehicle_id,

        data.part_name,
        data.sku,
        data.category,
        data.description,
        data.brand,

        data.opening_stock,
        data.current_stock,
        data.min_stock,
        data.reorder_level,
        data.unit,

        data.cost_price,
        data.selling_price,
        data.inventory_value,

        data.vehicle_type,
        data.compatible_vehicles,
        data.service_interval,

        data.preferred_vendor,
        data.gst_number,
        data.vendor_contact,

        data.warehouse,
        data.rack_no,
        data.bin_no,

        data.expiry_date,
        data.warranty,

        data.part_image,
        data.files,

        data.notes,
        data.stock_status,

        data.created_by
      ]
    );

    return result;
  },

  // ✅ GET ALL PARTS
  getAll: async () => {

    const [rows] = await db.query(`
      SELECT
        p.*,
        v.vehicle_no
      FROM inventory_parts p
      LEFT JOIN vehicles v
      ON p.vehicle_id = v.id
      ORDER BY p.created_at DESC
    `);

    return rows;
  },

  // ✅ GET PART BY ID
  getById: async (id) => {

    const [rows] = await db.query(`
      SELECT
        p.*,
        v.vehicle_no
      FROM inventory_parts p
      LEFT JOIN vehicles v
      ON p.vehicle_id = v.id
      WHERE p.id = ?
    `, [id]);

    return rows[0];
  },

  // ✅ UPDATE PART
  update: async (id, data) => {

    const [result] = await db.query(
      `UPDATE inventory_parts
       SET ?
       WHERE id = ?`,
      [data, id]
    );

    return result;
  },

  // ✅ DELETE PART
  delete: async (id) => {

    const [result] = await db.query(
      `DELETE FROM inventory_parts
       WHERE id = ?`,
      [id]
    );

    return result;
  }

};


// ✅ GET INVENTORY BY VEHICLE NUMBER
getInventoryByVehicle: async (vehicleNumber) => {

  const [rows] = await db.query(
    `
    SELECT *
    FROM inventory_issue_history
    WHERE vehicle_number = ?
    ORDER BY created_at DESC
    `,
    [vehicleNumber]
  );

  return rows;
}
module.exports = Inventory;