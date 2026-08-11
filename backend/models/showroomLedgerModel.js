const db = require("../config/db");

const ShowroomLedger = {

  getLedgerByShowroomId: async (showroomId) => {

    // Showroom + its vehicles in a single round trip (LEFT JOIN, matched by name)
    const [rows] = await db.query(
      `
      SELECT
        s.id, s.showroom_name, s.mobile_number, s.email, s.address_location,
        s.status, s.contact_person, s.designation, s.bank_name, s.custom_bank_name,
        s.account_number, s.ifsc_code, s.upi_id, s.opening_balance, s.created_at, s.updated_at,

        v.id AS vehicle_id, v.vehicle_no, v.make_brand, v.model_year, v.purchase_date, v.purchase_amount,
        v.vehicle_status, v.dealer_showroom,
        v.purchase_receipt, v.warranty_document, v.purchase_proof,
        v.financier_name, v.loan_account_number, v.emi_amount, v.emi_date, v.loan_tenure,
        (SELECT COUNT(*) FROM vehicle_emi_payments ep WHERE ep.vehicle_id = v.id) AS emi_paid_count
      FROM showrooms s
      LEFT JOIN vehicles v
        ON v.dealer_showroom = s.showroom_name
      WHERE s.id = ?
      ORDER BY v.purchase_date DESC
      `,
      [showroomId]
    );

    if (!rows.length) {
      return null;
    }

    const {
      vehicle_id, vehicle_no, make_brand, model_year, purchase_date, purchase_amount,
      vehicle_status, dealer_showroom, purchase_receipt, warranty_document, purchase_proof,
      financier_name, loan_account_number, emi_amount, emi_date, loan_tenure, emi_paid_count,
      ...showroom
    } = rows[0];

    const vehicles = rows
      .filter(r => r.vehicle_id !== null)
      .map(r => ({
        id: r.vehicle_id,
        vehicle_no: r.vehicle_no,
        make_brand: r.make_brand,
        model_year: r.model_year,
        purchase_date: r.purchase_date,
        purchase_amount: r.purchase_amount,
        vehicle_status: r.vehicle_status,
        dealer_showroom: r.dealer_showroom,
        purchase_receipt: r.purchase_receipt,
        warranty_document: r.warranty_document,
        purchase_proof: r.purchase_proof,
        financier_name: r.financier_name,
        loan_account_number: r.loan_account_number,
        emi_amount: r.emi_amount,
        emi_date: r.emi_date,
        loan_tenure: r.loan_tenure,
        emi_paid_count: r.emi_paid_count
      }));

    const vehicleNos = vehicles.map(v => v.vehicle_no);

    let claims = [];
    let warranties = [];

    if (vehicleNos.length > 0) {
      const placeholders = vehicleNos.map(() => '?').join(',');

      // Independent of each other — run in parallel instead of back-to-back
      [[claims], [warranties]] = await Promise.all([
        db.query(
          `SELECT * FROM warranty_claims WHERE vehicle_no IN (${placeholders}) ORDER BY claim_date DESC`,
          vehicleNos
        ),
        db.query(
          `SELECT id, warranty_number, item_title, category, vehicle_no, purchase_date,
                  start_date, end_date, warranty_period, warranty_type, warranty_status,
                  vendor_name, purchase_cost, claim_amount, warranty_card, invoice_file
           FROM warranties WHERE vehicle_no IN (${placeholders}) ORDER BY start_date DESC`,
          vehicleNos
        )
      ]);
    }

    const totalVehicles =
      vehicles.length;

    const totalPurchaseValue =
      vehicles.reduce(
        (sum, v) =>
          sum + Number(v.purchase_amount || 0),
        0
      );

    const totalClaims =
      claims.length;

    const pendingClaims =
      claims.filter(c =>
        c.claim_status === "Submitted" ||
        c.claim_status === "Pending Parts"
      ).length;

    const approvedClaims =
      claims.filter(
        c => c.claim_status === "Approved"
      ).length;

    const rejectedClaims =
      claims.filter(
        c => c.claim_status === "Rejected"
      ).length;

    // "Pending" here means money the showroom hasn't actually paid back yet —
    // a claim can sit at "Approved" for a while before the showroom settles
    // it, so this is driven by claim_available_amount minus whatever's been
    // recorded as received (approved_amount), not just claim_status. Rejected
    // claims never yield money, so they're excluded entirely.
    const totalReceived =
      claims
        .filter(c => c.claim_status !== "Rejected")
        .reduce((sum, c) => sum + Number(c.approved_amount || 0), 0);

    const pendingAmount =
      claims
        .filter(c => c.claim_status !== "Rejected")
        .reduce(
          (sum, c) =>
            sum +
            Math.max(
              0,
              Number(c.claim_available_amount || 0) - Number(c.approved_amount || 0)
            ),
          0
        );

    return {
      showroom,
      vehicles,
      claims,
      warranties,
      summary: {
        totalVehicles,
        totalPurchaseValue,
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        pendingAmount,
        totalReceived
      }
    };
  }

};

module.exports = ShowroomLedger;