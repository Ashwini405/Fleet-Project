const db = require("../config/db");
const Vendor = require("../models/vendorModel");
const VendorTransaction = require("../models/vendorTransactionModel");
const VendorPayment =
  require("../models/vendorPaymentModel");

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
          CONCAT(COALESCE(v.make_brand, ''), CASE WHEN v.make_brand IS NULL OR v.make_brand = '' THEN '' ELSE ' - ' END, vs.service_type) AS description,
          vs.total_cost AS debit,
          0 AS credit,
          NULL AS reference_number,
          v.type AS vehicle_type,
          NULL AS payment_mode,
          NULL AS notes,
            NULL AS receipt_files,
            GROUP_CONCAT(sf.file_name) AS proof_files
      FROM vehicle_services vs
      LEFT JOIN vehicles v
      ON vs.vehicle_id = v.id
          LEFT JOIN service_files sf ON sf.service_id = vs.id
      WHERE vs.garage_id = ? OR (vs.garage_id IS NULL AND vs.mechanic = ?)
          GROUP BY vs.id, vs.service_date, v.vehicle_no, v.make_brand, vs.service_type, vs.total_cost, v.type

      UNION ALL

      SELECT
          rs.id,
          rs.service_date AS transaction_date,
          'Repair Work' AS transaction_type,
          rs.vehicle_no AS truck_no,
            rs.issue_description AS description,
          rs.total_cost AS debit,
          0 AS credit,
            NULL AS reference_number,
            v.type AS vehicle_type,
            NULL AS payment_mode,
            NULL AS notes,
            NULL AS receipt_files,
            rs.files AS proof_files
      FROM repair_services rs
          LEFT JOIN vehicles v ON rs.vehicle_id = v.id
          WHERE rs.garage_id = ? OR (rs.garage_id IS NULL AND rs.garage = ?)

      UNION ALL

        SELECT
          vt.id,
          vt.transaction_date,
          vt.transaction_type,
          '-' AS truck_no,
          vt.remarks AS description,
          vt.debit,
          vt.credit,
          NULL AS reference_number,
          NULL AS vehicle_type,
          NULL AS payment_mode,
          vt.remarks AS notes,
          NULL AS receipt_files,
          NULL AS proof_files
        FROM vendor_transactions vt
        WHERE vt.vendor_id = ?

        UNION ALL

        SELECT
          vp.id,
          vp.payment_date AS transaction_date,
          'Payment' AS transaction_type,
          '-' AS truck_no,
          vp.notes AS description,
          0 AS debit,
          vp.amount AS credit,
          vp.reference_number,
          NULL AS vehicle_type,
          vp.payment_mode,
          vp.notes,
          vp.receipt_files,
          NULL AS proof_files
        FROM vendor_payments vp
        WHERE vp.vendor_id = ?
          AND (vp.vendor_category = 'garages' OR vp.vendor_category IS NULL)

      ORDER BY transaction_date DESC, id DESC
      `,
      [
        vendorId,
        garageName,
        vendorId,
        garageName,
        vendorId,
        vendorId
      ]
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