const db = require("../config/db");

// Ensure payment_terms column exists
(async () => {
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rta_vendors'`
    );
    const colNames = cols.map(c => c.COLUMN_NAME);
    if (!colNames.includes('payment_terms')) {
      await db.query(`ALTER TABLE rta_vendors ADD COLUMN payment_terms VARCHAR(50) DEFAULT 'credit'`);
      console.log('rta_vendors: added payment_terms column');
    }
  } catch (err) {
    console.error('rta_vendors column check error:', err.message);
  }
})();

const getAllVendors = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM rta_vendors
    ORDER BY created_at DESC
  `);

  return rows;
};


const getVendorById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM rta_vendors
    WHERE id = ?
    `,
    [id]
  );

  return rows[0];
};

const createVendor = async (vendorData) => {
  const {
    vendor_name,
    mobile_number,
    email,
    address_location,
    agent_type,
    opening_balance,
    status,
    payment_terms,
    bank_name,
    custom_bank_name,
    account_number,
    ifsc_code,
    upi_id,
    notes,
  } = vendorData;

  const [result] = await db.query(
    `
    INSERT INTO rta_vendors (
      vendor_name,
      mobile_number,
      email,
      address_location,
      agent_type,
      opening_balance,
      status,
      payment_terms,
      bank_name,
      custom_bank_name,
      account_number,
      ifsc_code,
      upi_id,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      vendor_name,
      mobile_number,
      email,
      address_location,
      agent_type,
      opening_balance,
      status,
      payment_terms || "credit",
      bank_name,
      custom_bank_name,
      account_number,
      ifsc_code,
      upi_id,
      notes,
    ]
  );

  return result.insertId;
};

const updateVendor = async (id, vendorData) => {
  const {
    vendor_name,
    mobile_number,
    email,
    address_location,
    agent_type,
    opening_balance,
    status,
    payment_terms,
    bank_name,
    custom_bank_name,
    account_number,
    ifsc_code,
    upi_id,
    notes,
  } = vendorData;

  await db.query(
    `
    UPDATE rta_vendors
    SET
      vendor_name = ?,
      mobile_number = ?,
      email = ?,
      address_location = ?,
      agent_type = ?,
      opening_balance = ?,
      status = ?,
      payment_terms = ?,
      bank_name = ?,
      custom_bank_name = ?,
      account_number = ?,
      ifsc_code = ?,
      upi_id = ?,
      notes = ?
    WHERE id = ?
    `,
    [
      vendor_name,
      mobile_number,
      email,
      address_location,
      agent_type,
      opening_balance,
      status,
      payment_terms || "credit",
      bank_name,
      custom_bank_name,
      account_number,
      ifsc_code,
      upi_id,
      notes,
      id,
    ]
  );
};

const deleteVendor = async (id) => {
  await db.query(
    `
    DELETE FROM rta_vendors
    WHERE id = ?
    `,
    [id]
  );
};

const checkDuplicateMobile = async (mobile) => {
  const [rows] = await db.query(
    `
    SELECT id
    FROM rta_vendors
    WHERE mobile_number = ?
    `,
    [mobile]
  );

  return rows.length > 0;
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  checkDuplicateMobile,
};