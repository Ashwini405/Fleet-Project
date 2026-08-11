const db = require("../config/db");

const getVendorLedger = async (vendorId) => {
  try {
    const [vendorRows] = await db.query(
      `
      SELECT *
      FROM labour_vendors
      WHERE id = ?
      `,
      [vendorId]
    );

    if (!vendorRows.length) {
      return null;
    }

    const vendor = vendorRows[0];

    let transactions = [];

    // LABOUR CHARGES — derived from repairs registered against this vendor's name
    const [repairRows] = await db.query(
      `
      SELECT
        id,
        vehicle_no,
        service_date,
        labour_cost,
        breakdown_type
      FROM repair_services
      WHERE garage = ?
        AND labour_cost > 0
      `,
      [vendor.vendor_name]
    );

    repairRows.forEach((row) => {
      transactions.push({
        id: `LAB-${row.id}`,
        date: row.service_date,
        type: "Labour Charge",
        ref: `REP-${row.id}`,
        desc: `${row.breakdown_type || "Repair"} — ${row.vehicle_no || ""}`.trim(),
        debit: Number(row.labour_cost || 0),
        credit: 0,
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
