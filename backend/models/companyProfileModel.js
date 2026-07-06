const db = require("../config/db");

// ==============================================
// Generate Company Code
// ==============================================
const generateCompanyCode = async () => {
  const sql = `
    SELECT company_code
    FROM company_profile
    ORDER BY id DESC
    LIMIT 1
  `;

  const [rows] = await db.query(sql);

  if (rows.length === 0) {
    return "COMP-0001";
  }

  const lastCode = rows[0].company_code;
  const number = parseInt(lastCode.split("-")[1], 10) + 1;

  return `COMP-${String(number).padStart(4, "0")}`;
};

// ==============================================
// Create Company Profile
// ==============================================
const createCompanyProfile = async (data) => {

  const companyCode = await generateCompanyCode();

  const sql = `
    INSERT INTO company_profile (

      company_code,

      company_name,
      legal_name,

      gst_number,
      pan_number,
      cin_number,

      industry_type,
      company_status,

      website,
      established_date,

      office_phone,
      mobile_number,

      primary_email,
      support_email,
      emergency_contact,

      address_line1,
      address_line2,

      city,
      state,
      country,
      pincode,

      maps_location,

      financial_year,
      currency,
      timezone,
      date_format,

      default_tax,

      invoice_prefix,
      trip_prefix,
      vehicle_prefix,
      po_prefix,
      settlement_prefix,

      primary_color,
      secondary_color,

      report_header,
      report_footer,

      company_logo,
      favicon_logo,
      company_signature,

      gst_certificate,
      pan_card,
      registration_certificate,
      trade_license,
      insurance_certificate

    )

    VALUES (

  ?,?,?,?,?,?,?,?,?,?,
  ?,?,?,?,?,?,?,?,?,?,
  ?,?,?,?,?,?,?,?,?,?,
  ?,?,?,?,?,?,?,?,?,?,
  ?,?,?,?

)
  `;

  const values = [

    companyCode,

    data.company_name,
    data.legal_name,

    data.gst_number,
    data.pan_number,
    data.cin_number,

    data.industry_type,
    data.company_status,

    data.website,
    data.established_date,

    data.office_phone,
    data.mobile_number,

    data.primary_email,
    data.support_email,
    data.emergency_contact,

    data.address_line1,
    data.address_line2,

    data.city,
    data.state,
    data.country,
    data.pincode,

    data.maps_location,

    data.financial_year,
    data.currency,
    data.timezone,
    data.date_format,

    data.default_tax,

    data.invoice_prefix,
    data.trip_prefix,
    data.vehicle_prefix,
    data.po_prefix,
    data.settlement_prefix,

    data.primary_color,
    data.secondary_color,

    data.report_header,
    data.report_footer,

    data.company_logo,
    data.favicon_logo,
    data.company_signature,

    data.gst_certificate,
    data.pan_card,
    data.registration_certificate,
    data.trade_license,
    data.insurance_certificate

  ];

  const [result] = await db.query(sql, values);

  return result;
};

// ==============================================
// Get Company Profile
// ==============================================
const getCompanyProfile = async () => {

  const sql = `
    SELECT *
    FROM company_profile
    LIMIT 1
  `;

  const [rows] = await db.query(sql);

  return rows.length ? rows[0] : null;
};

// ==============================================
// Get By ID
// ==============================================
const getCompanyProfileById = async (id) => {

  const sql = `
    SELECT *
    FROM company_profile
    WHERE id = ?
  `;

  const [rows] = await db.query(sql, [id]);

  return rows.length ? rows[0] : null;
};

// ==============================================
// Update Company Profile
// ==============================================
const updateCompanyProfile = async (id, data) => {

  const sql = `
    UPDATE company_profile
    SET

      company_name=?,
      legal_name=?,

      gst_number=?,
      pan_number=?,
      cin_number=?,

      industry_type=?,
      company_status=?,

      website=?,
      established_date=?,

      office_phone=?,
      mobile_number=?,

      primary_email=?,
      support_email=?,
      emergency_contact=?,

      address_line1=?,
      address_line2=?,

      city=?,
      state=?,
      country=?,
      pincode=?,

      maps_location=?,

      financial_year=?,
      currency=?,
      timezone=?,
      date_format=?,

      default_tax=?,

      invoice_prefix=?,
      trip_prefix=?,
      vehicle_prefix=?,
      po_prefix=?,
      settlement_prefix=?,

      primary_color=?,
      secondary_color=?,

      report_header=?,
      report_footer=?,

      company_logo=?,
      favicon_logo=?,
      company_signature=?,

      gst_certificate=?,
      pan_card=?,
      registration_certificate=?,
      trade_license=?,
      insurance_certificate=?

    WHERE id=?
  `;

  const values = [

    data.company_name,
    data.legal_name,

    data.gst_number,
    data.pan_number,
    data.cin_number,

    data.industry_type,
    data.company_status,

    data.website,
    data.established_date,

    data.office_phone,
    data.mobile_number,

    data.primary_email,
    data.support_email,
    data.emergency_contact,

    data.address_line1,
    data.address_line2,

    data.city,
    data.state,
    data.country,
    data.pincode,

    data.maps_location,

    data.financial_year,
    data.currency,
    data.timezone,
    data.date_format,

    data.default_tax,

    data.invoice_prefix,
    data.trip_prefix,
    data.vehicle_prefix,
    data.po_prefix,
    data.settlement_prefix,

    data.primary_color,
    data.secondary_color,

    data.report_header,
    data.report_footer,

    data.company_logo,
    data.favicon_logo,
    data.company_signature,

    data.gst_certificate,
    data.pan_card,
    data.registration_certificate,
    data.trade_license,
    data.insurance_certificate,

    id

  ];

  const [result] = await db.query(sql, values);

  return result;
};

// ==============================================
// Delete Company Profile
// ==============================================
const deleteCompanyProfile = async (id) => {

  const sql = `
    DELETE
    FROM company_profile
    WHERE id=?
  `;

  const [result] = await db.query(sql, [id]);

  return result;
};

module.exports = {

  createCompanyProfile,

  getCompanyProfile,

  getCompanyProfileById,

  updateCompanyProfile,

  deleteCompanyProfile

};