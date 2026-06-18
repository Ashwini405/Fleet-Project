const db = require("../config/db");

const getVendorLedger = async (vendorId) => {
  try {
    const [vendorRows] = await db.query(
      `
      SELECT *
      FROM fuel_vendors
      WHERE id = ?
      `,
      [vendorId]
    );

    if (!vendorRows.length) {
      return null;
    }

    const vendor = vendorRows[0];

    const [fuelRows] = await db.query(
      `
      SELECT
        id,
        date,
        vehicle_no,
        fuel_type,
        quantity,
        rate,
        total_cost,
        bill_number,
        location,
        filled_by,
        remarks
      FROM fuel_entries
      WHERE vendor = ?
      ORDER BY date ASC
      `,
      [vendor.vendor_name]
    );

    let runningBalance = 0;

    const transactions = fuelRows.map((row) => {
      runningBalance += Number(row.total_cost || 0);

      return {
        id: row.id,
        date: row.date,
        truckId: row.vehicle_no,
        type: "Fuel Fill",
        ref: row.bill_number,
        desc:
          `${row.fuel_type || "Fuel"} ${row.quantity || 0}L @ ₹${row.rate || 0}`,
        fuelQty: `${row.quantity || 0} L`,
        ratePerL: `₹${row.rate || 0}`,
        fuelType: row.fuel_type,
        location: row.location,
        filledBy: row.filled_by,
        remarks: row.remarks,
        debit: Number(row.total_cost || 0),
        credit: 0,
        runningBalance,
      };
    });

    return {
      vendor,
      transactions,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getVendorLedger,
};