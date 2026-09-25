const db = require("../config/db");

const getVendorLedger = async (vendorId) => {
  try {
    const [vendorRows] = await db.query(
      `
      SELECT *
      FROM oil_vendors
      WHERE id = ?
      `,
      [vendorId]
    );

    if (!vendorRows.length) {
      return null;
    }

    const vendor = vendorRows[0];

    // PURCHASE ORDERS
    const [purchaseRows] = await db.query(
      `
      SELECT
        id,
        po_number,
        item_name,
        quantity,
        total_amount,
        requested_date,
        expected_delivery,
        status,
        vendor
      FROM inventory_purchase_orders
      WHERE LOWER(TRIM(vendor)) = LOWER(TRIM(?))
      ORDER BY id DESC
      `,
      [vendor.vendor_name]
    );

    // RETURNS
    const [returnRows] = await db.query(
      `SELECT r.id, r.return_date, r.po_number, r.return_reason,
              r.quantity_returned, r.credit_amount, r.vehicle_number, p.part_name, p.category
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

    // PAYMENTS
    const [paymentRows] = await db.query(
      `SELECT * FROM vendor_payments
        WHERE vendor_id = ? AND (vendor_category IN ('oil', 'oils', 'oil_vendors') OR vendor_category IS NULL)
        ORDER BY payment_date ASC, id ASC`,
      [vendorId]
    );

    return {
      vendor,
      orders: purchaseRows,
      returns: returnRows,
      payments: paymentRows,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getVendorLedger,
};