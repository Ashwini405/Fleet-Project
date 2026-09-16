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
        f.id,
        f.date,
        f.vehicle_no,
        t.trip_id AS trip_number,
        t.driver_name,
        f.fuel_type,
        f.quantity,
        f.rate,
        f.total_cost,
        f.bill_number,
        f.payment_method,
        f.receipt_files,
        f.location,
        f.filled_by,
        f.remarks
      FROM fuel_entries f
      LEFT JOIN trips t ON t.id = f.trip_id
      WHERE f.vendor = ?
      ORDER BY f.date ASC
      `,
      [vendor.vendor_name]
    );

    const [paymentRows] = await db.query(
      `
      SELECT
        id,
        payment_date,
        amount,
        payment_mode,
        reference_number,
        notes,
        receipt_files
      FROM vendor_payments
      WHERE vendor_id = ? AND vendor_category = 'fuel'
      ORDER BY payment_date ASC, id ASC
      `,
      [vendor.id]
    );

    let runningBalance = 0;

    const fuelTransactions = fuelRows.flatMap((row) => {
      const totalCost = Number(row.total_cost || 0);

      let receiptFiles = [];
      try {
        receiptFiles = row.receipt_files ? JSON.parse(row.receipt_files) : [];
      } catch (error) {
        receiptFiles = [];
      }

      const fuelTransaction = {
        id: row.id,
        date: row.date,
        truckId: row.vehicle_no,
        tripNumber: row.trip_number,
        driverName: row.driver_name,
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
        debit: totalCost,
        credit: 0,
        paidAmount: 0,
        remainingDue: totalCost,
        runningBalance: 0,
      };

      if (vendor.payment_terms === 'cash') {
        return [{
          ...fuelTransaction,
          credit: totalCost,
          paidAmount: totalCost,
          remainingDue: 0,
          paymentMethod: row.payment_method || 'Cash',
          receiptFiles,
          runningBalance: 0,
        }];
      }

      return [fuelTransaction];
    });

    const paymentTransactions = paymentRows.map((row) => {
      let amountLeft = Number(row.amount || 0);
      const appliedTo = [];
      const allocationMatch = String(row.notes || '').match(/__fuel_allocation_ids:([^_]+)__/);
      const selectedFuelIds = allocationMatch
        ? new Set(allocationMatch[1].split(',').map(id => id.trim()).filter(Boolean))
        : null;
      const visibleNotes = String(row.notes || '')
        .replace(/__fuel_allocation_ids:[^_]+__\s*/g, '')
        .trim();

      fuelTransactions.forEach((fuel) => {
        if (selectedFuelIds && !selectedFuelIds.has(String(fuel.id))) return;
        if (amountLeft <= 0 || fuel.remainingDue <= 0) return;
        const applied = Math.min(amountLeft, fuel.remainingDue);
        fuel.paidAmount += applied;
        fuel.remainingDue -= applied;
        amountLeft -= applied;
        appliedTo.push({
          vehicle: fuel.truckId,
          trip: fuel.tripNumber,
          reference: fuel.ref,
          amount: applied,
        });
      });

      const linkedVehicles = [...new Set(appliedTo.map(item => item.vehicle).filter(Boolean))];
      const linkedTrips = [...new Set(appliedTo.map(item => item.trip).filter(Boolean))];
      const appliedLabel = appliedTo.length
        ? appliedTo.map(item => `${item.vehicle || 'Vehicle'}${item.trip ? ` / ${item.trip}` : ''}: ₹${item.amount.toLocaleString('en-IN')}`).join(', ')
        : 'No outstanding fuel record';

      let paymentReceiptFiles = [];
      try {
        paymentReceiptFiles = row.receipt_files ? JSON.parse(row.receipt_files) : [];
      } catch (error) {
        paymentReceiptFiles = [];
      }

      return {
        id: `payment-${row.id}`,
        date: row.payment_date,
        type: 'Payment',
        ref: row.reference_number,
        truckId: linkedVehicles.length === 1 ? linkedVehicles[0] : null,
        tripNumber: linkedTrips.length === 1 ? linkedTrips[0] : null,
        desc: visibleNotes || `Payment via ${row.payment_mode || 'Unknown'}`,
        paymentMethod: row.payment_mode,
        receiptFiles: paymentReceiptFiles,
        appliedTo,
        appliedLabel,
        debit: 0,
        credit: Number(row.amount || 0),
        runningBalance: 0,
      };
    });

    const transactions = [...fuelTransactions, ...paymentTransactions]
      .sort((a, b) => new Date(a.date) - new Date(b.date) || String(a.id).localeCompare(String(b.id)))
      .map((transaction) => {
        runningBalance += Number(transaction.debit || 0) - Number(transaction.credit || 0);
        return {
          ...transaction,
          runningBalance: vendor.payment_terms === 'cash' ? 0 : runningBalance,
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