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

    let transactions = [];

    // PURCHASE ORDERS
    const [purchaseRows] = await db.query(
      `
      SELECT
        po_number,
        total_amount,
        requested_date,
        status
      FROM inventory_purchase_orders
      WHERE vendor = ?
      `,
      [vendor.vendor_name]
    );

    purchaseRows.forEach((row, index) => {
      transactions.push({
        id: `PUR-${index}`,
        date: row.requested_date,
        type: "Purchase",
        ref: row.po_number,
        desc: `Purchase Order`,
        debit: Number(row.total_amount || 0),
        credit: 0,
        status: row.status,
      });
    });

    transactions.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let runningBalance = 0;

    transactions = transactions.map((txn) => {
      runningBalance +=
        Number(txn.debit || 0) -
        Number(txn.credit || 0);

      return {
        ...txn,
        runningBalance,
      };
    });

    return {
      vendor,
      transactions,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getVendorLedger,
};