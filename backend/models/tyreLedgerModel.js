const db = require("../config/db");

const getVendorLedger = async (vendorId) => {
  try {
    const [vendorRows] = await db.query(
      `
      SELECT *
      FROM tyre_vendors
      WHERE id = ?
      `,
      [vendorId]
    );

    if (!vendorRows.length) {
      return null;
    }

    const vendor = vendorRows[0];

    let transactions = [];

    // ==========================
    // TYRE PURCHASES
    // ==========================
    const [purchaseRows] = await db.query(
      `
      SELECT
        purchase_date,
        invoice_number,
        tyre_number,
        tyre_cost
      FROM tyres
      WHERE vendor_name = ?
      `,
      [vendor.vendor_name]
    );

    purchaseRows.forEach((row, index) => {
      transactions.push({
        id: `PUR-${index}`,
        date: row.purchase_date,
        type: "Tyre Purchase",
        ref: row.invoice_number || "-",
        desc: `Tyre Purchase (${row.tyre_number})`,
        debit: Number(row.tyre_cost || 0),
        credit: 0,
      });
    });

    // ==========================
    // RETREADING
    // ==========================
    const [retreadRows] = await db.query(
      `
      SELECT
        sent_date,
        tyre_no,
        actual_cost
      FROM tyre_retreading
      WHERE vendor_name = ?
      `,
      [vendor.vendor_name]
    );

    retreadRows.forEach((row, index) => {
      transactions.push({
        id: `RET-${index}`,
        date: row.sent_date,
        type: "Retreading Service",
        ref: row.tyre_no || "-",
        desc: "Retreading Cost",
        debit: Number(row.actual_cost || 0),
        credit: 0,
      });
    });

    // ==========================
    // SCRAP SALES
    // ==========================
    const [scrapRows] = await db.query(
      `
      SELECT
        scrap_date,
        txn_no,
        sale_amount
      FROM tyre_scrap_history
      WHERE vendor_name = ?
      `,
      [vendor.vendor_name]
    );

    scrapRows.forEach((row, index) => {
      transactions.push({
        id: `SCR-${index}`,
        date: row.scrap_date,
        type: "Scrap Sale",
        ref: row.txn_no || "-",
        desc: "Scrap Tyre Sale",
        debit: 0,
        credit: Number(row.sale_amount || 0),
      });
    });

    // ==========================
    // SORT BY DATE
    // ==========================
    transactions.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // ==========================
    // RUNNING BALANCE
    // ==========================
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
    console.error(
      "MODEL ERROR:",
      error
    );

    throw error;
  }
};

module.exports = {
  getVendorLedger,
};