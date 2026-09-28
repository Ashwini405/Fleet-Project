const db = require("../config/db");

// Repairs count as a labour charge once they are Completed with a labour cost.
// Older repairs saved before labour_vendor_id existed are matched by name.
const repairMatch = (idExpr, nameExpr) => `
  (rs.labour_vendor_id = ${idExpr}
    OR (rs.labour_vendor_id IS NULL AND (rs.garage_id IS NULL OR rs.garage_id = 0) AND rs.garage = ${nameExpr}))
  AND rs.labour_cost > 0
  AND rs.status = 'Completed'
`;

const getVendorLedger = async (vendorId) => {
  const [vendorRows] = await db.query(
    `SELECT * FROM labour_vendors WHERE id = ?`,
    [vendorId]
  );

  if (!vendorRows.length) {
    return null;
  }

  const vendor = vendorRows[0];
  const transactions = [];

  const openingBalance = Number(vendor.opening_balance || 0);
  if (openingBalance !== 0) {
    transactions.push({
      id: `OPEN-${vendor.id}`,
      date: vendor.created_at,
      type: "Opening Balance",
      source: "opening",
      ref: "OPENING",
      desc: openingBalance > 0 ? "Opening balance payable" : "Opening advance paid",
      debit: openingBalance > 0 ? openingBalance : 0,
      credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
    });
  }

  // LABOUR CHARGES from completed repair jobs assigned to this contractor
  const [repairRows] = await db.query(
    `
    SELECT rs.id, rs.vehicle_no, rs.service_date, rs.completed_date, rs.labour_cost,
           rs.breakdown_type, rs.issue_description
    FROM repair_services rs
    WHERE ${repairMatch("?", "?")}
    `,
    [vendor.id, vendor.vendor_name]
  );

  repairRows.forEach((row) => {
    transactions.push({
      id: `LAB-${row.id}`,
      date: row.service_date || row.completed_date,
      type: "Labour Charge",
      source: "repair",
      repair_id: row.id,
      ref: `REP-${row.id}`,
      vehicle_no: row.vehicle_no || null,
      work_type: `${row.breakdown_type || "General"} Repair`,
      desc: `${row.breakdown_type || "Repair"} repair${row.vehicle_no ? ` — ${row.vehicle_no}` : ""}${row.issue_description ? ` (${row.issue_description})` : ""}`,
      debit: Number(row.labour_cost || 0),
      credit: 0,
    });
  });

  // LABOUR CHARGES entered directly in the ledger (loading, washing, daily wages …)
  const [chargeRows] = await db.query(
    `SELECT * FROM labour_charges WHERE vendor_id = ? ORDER BY charge_date ASC, id ASC`,
    [vendor.id]
  );

  chargeRows.forEach((row) => {
    transactions.push({
      id: `CHG-${row.id}`,
      charge_id: row.id,
      date: row.charge_date,
      type: "Labour Charge",
      source: "manual",
      ref: row.reference_number || `LC-${row.id}`,
      vehicle_no: row.vehicle_no || null,
      work_type: row.work_type,
      workers: row.workers,
      desc: `${row.work_type}${row.vehicle_no ? ` — ${row.vehicle_no}` : ""}${row.description ? ` (${row.description})` : ""}`,
      debit: Number(row.amount || 0),
      credit: 0,
    });
  });

  const [paymentRows] = await db.query(
    `SELECT * FROM vendor_payments
      WHERE vendor_id = ? AND vendor_category IN ('labour', 'labour_vendors')
      ORDER BY payment_date ASC, id ASC`,
    [vendor.id]
  );

  paymentRows.forEach((row) => {
    transactions.push({
      id: `PAY-${row.id}`,
      date: row.payment_date,
      type: "Payment",
      source: "payment",
      ref: row.reference_number || `PAY-${row.id}`,
      payment_mode: row.payment_mode,
      desc: `${row.payment_mode || "Bank"} Payment${row.notes ? " — " + row.notes : ""}`,
      debit: 0,
      credit: Number(row.amount || 0),
      receipt_files: row.receipt_files,
      status: "Completed",
    });
  });

  return { vendor, transactions };
};

// Outstanding payable per vendor, used by the Labour Accounts cards
const getOutstandingByVendor = async () => {
  const [rows] = await db.query(`
    SELECT
      lv.id,
      COALESCE(lv.opening_balance, 0)
      + COALESCE((SELECT SUM(rs.labour_cost) FROM repair_services rs
                  WHERE ${repairMatch("lv.id", "lv.vendor_name")}), 0)
      + COALESCE((SELECT SUM(lc.amount) FROM labour_charges lc WHERE lc.vendor_id = lv.id), 0)
      - COALESCE((SELECT SUM(vp.amount) FROM vendor_payments vp
                  WHERE vp.vendor_id = lv.id AND vp.vendor_category IN ('labour', 'labour_vendors')), 0)
      AS outstanding
    FROM labour_vendors lv
  `);

  return rows.reduce((acc, row) => {
    acc[row.id] = Number(row.outstanding || 0);
    return acc;
  }, {});
};

const addCharge = async (vendorId, data) => {
  const [result] = await db.query(
    `
    INSERT INTO labour_charges
      (vendor_id, charge_date, vehicle_id, vehicle_no, work_type, description, workers, amount, reference_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      vendorId,
      data.charge_date,
      data.vehicle_id || null,
      data.vehicle_no || null,
      data.work_type || "General Labour",
      data.description || null,
      data.workers ? Number(data.workers) : null,
      Number(data.amount),
      data.reference_number || null,
    ]
  );
  return result;
};

const deleteCharge = async (chargeId) => {
  const [result] = await db.query(`DELETE FROM labour_charges WHERE id = ?`, [chargeId]);
  return result;
};

module.exports = {
  getVendorLedger,
  getOutstandingByVendor,
  addCharge,
  deleteCharge,
};
