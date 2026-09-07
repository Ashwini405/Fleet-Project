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
        id,
        purchase_date,
        invoice_number,
        tyre_number,
        serial_no,
        brand,
        model,
        tyre_size,
        material_type,
        status,
        expected_life_km,
        warranty_months,
        tyre_files,
        tyre_cost,
        paid_amount,
        payment_status
      FROM tyres
      WHERE vendor_name = ?
      `,
      [vendor.vendor_name]
    );

    purchaseRows.forEach((row, index) => {
      transactions.push({
        id: `PUR-${index}`,
        tyreId: row.id,
        date: row.purchase_date,
        type: "Tyre Purchase",
        ref: row.invoice_number || "-",
        desc: `Tyre Purchase (${row.tyre_number})`,
        debit: Number(row.tyre_cost || 0),
        credit: 0,
        tyreProfile: {
          tyreNumber: row.tyre_number,
          serialNo: row.serial_no,
          brand: row.brand,
          model: row.model,
          tyreSize: row.tyre_size,
          materialType: row.material_type,
          status: row.status,
          expectedLifeKm: row.expected_life_km,
          warrantyMonths: row.warranty_months,
          tyreFiles: row.tyre_files,
          paidAmount: Number(row.paid_amount || 0),
          paymentStatus: row.payment_status || 'Unpaid',
        },
      });
    });

    // ==========================
    // PAYMENTS RECORDED AGAINST THIS VENDOR
    // ==========================
    const [paymentRows] = await db.query(
      `
      SELECT
        id,
        payment_date,
        amount,
        payment_mode,
        reference_number,
        notes
      FROM vendor_payments
      WHERE vendor_id = ? AND vendor_category = 'tyres'
      `,
      [vendor.id]
    );

    paymentRows.forEach((row) => {
      transactions.push({
        id: `PAY-${row.id}`,
        date: row.payment_date,
        type: "Payment",
        ref: row.reference_number || "-",
        desc: row.notes || `Payment via ${row.payment_mode}`,
        debit: 0,
        credit: Number(row.amount || 0),
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
        actual_cost,
        expected_cost,
        status,
        notes
      FROM tyre_retreading
      WHERE vendor_name = ?
      `,
      [vendor.vendor_name]
    );

    const RETREAD_DESC_SUFFIX = {
      IN_PROGRESS: " (Pending completion)",
      REJECTED: " (Rejected by vendor)",
      CANCELLED: " (Cancelled)",
    };

    retreadRows.forEach((row, index) => {
      transactions.push({
        id: `RET-${index}`,
        date: row.sent_date,
        type: "Retreading Service",
        ref: row.tyre_no || "-",
        desc: `Retreading Cost${RETREAD_DESC_SUFFIX[row.status] || ""}`,
        debit: Number(row.actual_cost || 0),
        credit: 0,
        retreadStatus: row.status,
        retreadNotes: row.notes || null,
        expectedCost: Number(row.expected_cost || 0),
      });
    });

    // ==========================
    // WARRANTY CLAIMS
    // ==========================
    // Claims aren't recorded against a vendor directly (warranty_claims has
    // no reliable vendor_name of its own) — joined via the tyre's serial
    // number, since that's what ties a claim back to which vendor actually
    // sold that specific tyre. debit/credit stay 0: a claim isn't money
    // owed to the vendor, it's a request for them to pay us back.
    const [claimRows] = await db.query(
      `
      SELECT
        wc.id,
        wc.claim_number,
        wc.claim_date,
        wc.serial_no,
        wc.issue_description,
        wc.claim_status,
        wc.claim_available_amount,
        wc.approved_amount
      FROM warranty_claims wc
      JOIN tyres t ON t.serial_no = wc.serial_no
      WHERE t.vendor_name = ?
      `,
      [vendor.vendor_name]
    );

    claimRows.forEach((row) => {
      transactions.push({
        id: `CLM-${row.id}`,
        claimId: row.id,
        date: row.claim_date,
        type: "Warranty Claim Raised",
        ref: row.claim_number || "-",
        desc: row.issue_description || `Warranty claim (${row.serial_no})`,
        debit: 0,
        credit: 0,
        claimStatus: row.claim_status,
        claimAmount: Number(row.claim_available_amount || 0),
        claimReceived: Number(row.approved_amount || 0),
      });
    });

    // ==========================
    // SCRAP SALES
    // ==========================
    const [scrapRows] = await db.query(
      `
      SELECT
        id,
        scrap_date,
        txn_no,
        tyre_no,
        make,
        model,
        tyre_size,
        vehicle_no,
        running_km,
        remaining_tread,
        sale_amount,
        reason,
        remarks
      FROM tyre_scrap_history
      WHERE vendor_name = ? OR (vendor_id IS NOT NULL AND vendor_id = ?)
      `,
      [vendor.vendor_name, vendor.id]
    );

    scrapRows.forEach((row, index) => {
      const tyreDetails = [row.make, row.model, row.tyre_size].filter(Boolean).join(' ');
      const descText = row.tyre_no
        ? `Scrap Tyre Sale — ${row.tyre_no}${tyreDetails ? ` (${tyreDetails})` : ''}`
        : 'Scrap Tyre Sale';

      transactions.push({
        id: `SCR-${row.id || index}`,
        date: row.scrap_date,
        type: "Scrap Sale",
        ref: row.txn_no || "-",
        desc: descText,
        truckId: row.vehicle_no || null,
        debit: 0,
        credit: Number(row.sale_amount || 0),
        tyreNo: row.tyre_no,
        scrapProfile: {
          tyreNo: row.tyre_no,
          make: row.make,
          model: row.model,
          tyreSize: row.tyre_size,
          vehicleNo: row.vehicle_no,
          runningKm: row.running_km,
          remainingTread: row.remaining_tread,
          reason: row.reason,
          remarks: row.remarks,
          saleAmount: Number(row.sale_amount || 0),
        },
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