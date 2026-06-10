const db = require("../config/db");
const Vendor = require("../models/vendorModel");
const VendorTransaction = require("../models/vendorTransactionModel");

// ======================================
// GET VENDOR LEDGER TRANSACTIONS
// ======================================

exports.getVendorTransactions = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    // Get vendor details
    const vendor = await Vendor.getVendorById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const garageName = vendor.garage_name;

    const [rows] = await db.query(
      `
      SELECT
          vs.id,
          vs.service_date AS transaction_date,
          'Periodic Service' AS transaction_type,
          v.vehicle_no AS truck_no,
          vs.service_type AS description,
          vs.total_cost AS debit,
          0 AS credit,
          NULL AS reference_number
      FROM vehicle_services vs
      LEFT JOIN vehicles v
      ON vs.vehicle_id = v.id
      WHERE vs.mechanic = ?

      UNION ALL

      SELECT
          rs.id,
          rs.service_date AS transaction_date,
          'Repair Work' AS transaction_type,
          rs.vehicle_no AS truck_no,
          rs.issue_description AS description,
          rs.total_cost AS debit,
          0 AS credit,
          NULL AS reference_number
      FROM repair_services rs
      WHERE rs.garage = ?

      UNION ALL

      SELECT
          vt.id,
          vt.transaction_date,
          vt.transaction_type,
          '-' AS truck_no,
          vt.remarks AS description,
          vt.debit,
          vt.credit,
          NULL AS reference_number
      FROM vendor_transactions vt
      WHERE vt.vendor_id = ?

      ORDER BY transaction_date DESC, id DESC
      `,
      [garageName, garageName, vendorId]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("GET LEDGER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// CREATE TRANSACTION
// ======================================

exports.createTransaction = async (req, res) => {
  try {
    const result =
      await VendorTransaction.create(req.body);

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      insertId: result.insertId,
    });

  } catch (error) {
    console.error("CREATE TRANSACTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};