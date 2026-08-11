const db = require("../config/db");

const WarrantyClaimPayment = {

  // Full payment history for a claim — a showroom often pays back a claim
  // in more than one installment, so this is a running log, not a single
  // overwritable total.
  getByClaimId: async (claimId) => {
    const [rows] = await db.query(
      `
      SELECT *
      FROM warranty_claim_payments
      WHERE claim_id = ?
      ORDER BY payment_date DESC, id DESC
      `,
      [claimId]
    );
    return rows;
  },

  // Records one payment, then rolls the running total back onto
  // warranty_claims.approved_amount / claim_closed_date so existing reads
  // of the claim (e.g. the showroom ledger's pending-amount calc) keep
  // working without needing to know about this table.
  create: async (claimId, data) => {
    const [result] = await db.query(
      `
      INSERT INTO warranty_claim_payments (claim_id, amount, payment_date, notes)
      VALUES (?, ?, ?, ?)
      `,
      [claimId, data.amount, data.payment_date, data.notes || null]
    );

    await db.query(
      `
      UPDATE warranty_claims wc
      SET
        approved_amount = (
          SELECT COALESCE(SUM(amount), 0) FROM warranty_claim_payments WHERE claim_id = ?
        ),
        claim_closed_date = (
          SELECT MAX(payment_date) FROM warranty_claim_payments WHERE claim_id = ?
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE wc.id = ?
      `,
      [claimId, claimId, claimId]
    );

    return result;
  }

};

module.exports = WarrantyClaimPayment;
