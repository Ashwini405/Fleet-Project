const db = require("../config/db");

const ShowroomLedger = {

  getLedgerByShowroomId: async (showroomId) => {

    // Showroom Details
    const [showroomRows] = await db.query(
      `
      SELECT *
      FROM showrooms
      WHERE id = ?
      `,
      [showroomId]
    );

    if (!showroomRows.length) {
      return null;
    }

    const showroom = showroomRows[0];

    // Vehicles
    const [vehicles] = await db.query(
      `
      SELECT *
      FROM vehicles
      WHERE dealer_showroom = ?
      ORDER BY purchase_date DESC
      `,
      [showroom.showroom_name]
    );

    const vehicleNos =
      vehicles.map(v => v.vehicle_no);

    let claims = [];

    if (vehicleNos.length > 0) {

      const placeholders =
        vehicleNos.map(() => "?").join(",");

      const [claimRows] = await db.query(
        `
        SELECT *
        FROM warranty_claims
        WHERE vehicle_no IN (${placeholders})
        ORDER BY claim_date DESC
        `,
        vehicleNos
      );

      claims = claimRows;
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

    const pendingAmount =
      claims
        .filter(c =>
          c.claim_status === "Submitted" ||
          c.claim_status === "Pending Parts"
        )
        .reduce(
          (sum, c) =>
            sum +
            Number(
              c.claim_available_amount || 0
            ),
          0
        );

    return {
      showroom,
      vehicles,
      claims,
      summary: {
        totalVehicles,
        totalPurchaseValue,
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        pendingAmount
      }
    };
  }

};

module.exports = ShowroomLedger;