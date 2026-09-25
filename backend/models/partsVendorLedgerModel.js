const db =
  require("../config/db");

const PartsVendorLedger = {

  getLedger: async (
    vendorId
  ) => {

    const [vendors] =
      await db.query(
        `
        SELECT *
        FROM parts_vendors
        WHERE id = ?
        `,
        [vendorId]
      );

    if (
      !vendors.length
    ) {
      return null;
    }

    const vendor =
      vendors[0];

    const [orders] =
      await db.query(
        `
        SELECT *
        FROM inventory_purchase_orders
        WHERE vendor = ?
        ORDER BY id DESC
        `,
        [vendor.vendor_name]
      );

    const [returns] = await db.query(
      `SELECT r.*, p.part_name, p.category
         FROM part_returns r
         LEFT JOIN inventory_parts p ON p.id = r.part_id
         WHERE LOWER(TRIM(COALESCE(r.vendor_name, ''))) = LOWER(TRIM(?))
            OR r.po_number IN (
              SELECT po_number FROM inventory_purchase_orders
              WHERE LOWER(TRIM(vendor)) = LOWER(TRIM(?))
            )
         ORDER BY r.id DESC`,
      [vendor.vendor_name, vendor.vendor_name]
    );

    const [payments] = await db.query(
      `SELECT *
         FROM vendor_payments
        WHERE vendor_id = ? AND (vendor_category IN ('parts', 'parts_vendor', 'parts_vendors') OR vendor_category IS NULL)
        ORDER BY payment_date ASC, id ASC`,
      [vendorId]
    );

    return {
      vendor,
      orders,
      returns,
      payments
    };

  }

};

module.exports =
  PartsVendorLedger;