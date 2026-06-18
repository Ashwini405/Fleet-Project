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

    return {
      vendor,
      orders
    };

  }

};

module.exports =
PartsVendorLedger;