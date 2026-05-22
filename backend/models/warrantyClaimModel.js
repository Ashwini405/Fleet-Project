const db = require('../config/db');


// ======================================================
// CREATE WARRANTY CLAIM
// ======================================================

const createWarrantyClaim = async (data) => {

  const [result] = await db.query(

    `

    INSERT INTO warranty_claims (

      claim_number,

      warranty_id,
      warranty_number,

      item_title,
      category,
      brand,
      model,
      serial_no,

      vehicle_id,
      vehicle_no,

      warranty_type,
      warranty_period,

      warranty_start_date,
      warranty_end_date,

      warranty_status,

      claim_available,

      vendor_name,
      vendor_contact_number,

      claim_available_amount,
      claim_used_amount,

      claim_date,

      issue_type,

      priority,

      complaint_number,

      complaint_docket,

      issue_description,

      vendor_contact_person,

      communication_contact_number,

      date_sent_to_vendor,

      expected_resolution_date,

      vendor_remarks,

      item_photos,

      invoice_copy,

      warranty_card_copy,

      complaint_report,

      additional_documents,

      claim_status,

      assigned_to,

      internal_notes,

      created_by

    )

    VALUES (

      ?, ?, ?,

      ?, ?, ?, ?, ?,

      ?, ?,

      ?, ?,

      ?, ?,

      ?,

      ?,

      ?, ?,

      ?, ?,

      ?,

      ?,

      ?,

      ?,

      ?,

      ?,

      ?,

      ?,

      ?,

      ?,

      ?,

      ?, ?, ?, ?, ?,

      ?,

      ?,

      ?,

      ?

    )

    `,

    [

      data.claim_number,

      data.warranty_id,
      data.warranty_number,

      data.item_title,
      data.category,
      data.brand,
      data.model,
      data.serial_no,

      data.vehicle_id || null,
      data.vehicle_no,

      data.warranty_type,
      data.warranty_period,

      data.warranty_start_date,
      data.warranty_end_date,

      data.warranty_status,

      data.claim_available,

      data.vendor_name,
      data.vendor_contact_number,

      data.claim_available_amount || 0,
      data.claim_used_amount || 0,

      data.claim_date,

      data.issue_type,

      data.priority,

      data.complaint_number,

      data.complaint_docket,

      data.issue_description,

      data.vendor_contact_person,

      data.communication_contact_number,

      data.date_sent_to_vendor,

      data.expected_resolution_date,

      data.vendor_remarks,

      data.item_photos,

      data.invoice_copy,

      data.warranty_card_copy,

      data.complaint_report,

      data.additional_documents,

      data.claim_status,

      data.assigned_to,

      data.internal_notes,

      data.created_by

    ]

  );

  return result;
};


// ======================================================
// GET ALL CLAIMS
// ======================================================

const getWarrantyClaims = async () => {

  const [claims] = await db.query(`

    SELECT *

    FROM warranty_claims

    ORDER BY created_at DESC

  `);

  return claims;
};


// ======================================================
// GET CLAIM BY ID
// ======================================================

const getWarrantyClaimById = async (id) => {

  const [claims] = await db.query(`

    SELECT *

    FROM warranty_claims

    WHERE id = ?

  `, [id]);

  return claims[0];
};


// ======================================================
// UPDATE WARRANTY CLAIM
// ======================================================

const updateWarrantyClaim = async (

  id,
  data

) => {

  const [result] = await db.query(

    `

    UPDATE warranty_claims

    SET

      warranty_id = ?,
      warranty_number = ?,

      item_title = ?,
      category = ?,
      brand = ?,
      model = ?,
      serial_no = ?,

      vehicle_id = ?,
      vehicle_no = ?,

      warranty_type = ?,
      warranty_period = ?,

      warranty_start_date = ?,
      warranty_end_date = ?,

      warranty_status = ?,

      claim_available = ?,

      vendor_name = ?,
      vendor_contact_number = ?,

      claim_available_amount = ?,
      claim_used_amount = ?,

      claim_date = ?,

      issue_type = ?,

      priority = ?,

      complaint_number = ?,

      complaint_docket = ?,

      issue_description = ?,

      vendor_contact_person = ?,

      communication_contact_number = ?,

      date_sent_to_vendor = ?,

      expected_resolution_date = ?,

      vendor_remarks = ?,

      item_photos = ?,

      invoice_copy = ?,

      warranty_card_copy = ?,

      complaint_report = ?,

      additional_documents = ?,

      claim_status = ?,

      assigned_to = ?,

      internal_notes = ?,

      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?

    `,

    [

      data.warranty_id,
      data.warranty_number,

      data.item_title,
      data.category,
      data.brand,
      data.model,
      data.serial_no,

      data.vehicle_id || null,
      data.vehicle_no,

      data.warranty_type,
      data.warranty_period,

      data.warranty_start_date,
      data.warranty_end_date,

      data.warranty_status,

      data.claim_available,

      data.vendor_name,
      data.vendor_contact_number,

      data.claim_available_amount || 0,
      data.claim_used_amount || 0,

      data.claim_date,

      data.issue_type,

      data.priority,

      data.complaint_number,

      data.complaint_docket,

      data.issue_description,

      data.vendor_contact_person,

      data.communication_contact_number,

      data.date_sent_to_vendor,

      data.expected_resolution_date,

      data.vendor_remarks,

      data.item_photos,

      data.invoice_copy,

      data.warranty_card_copy,

      data.complaint_report,

      data.additional_documents,

      data.claim_status,

      data.assigned_to,

      data.internal_notes,

      id

    ]

  );

  return result;
};

const updateClaimStatus = async (id, claim_status) => {
  const [result] = await db.query(
    'UPDATE warranty_claims SET claim_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [claim_status, id]
  );
  return result;
};

module.exports = {
  createWarrantyClaim,
  getWarrantyClaims,
  getWarrantyClaimById,
  updateWarrantyClaim,
  updateClaimStatus
};