const db = require('../config/db');


// ======================================================
// CREATE WARRANTY
// ======================================================

const createWarranty = async (data) => {

  const [result] = await db.query(

    `

    INSERT INTO warranties (

      warranty_number,

      item_title,
      category,
      brand,
      model,
      serial_no,

      vehicle_id,
      vehicle_no,
      odometer,

      purchase_date,
      start_date,
      end_date,
      warranty_period,

      warranty_type,
      warranty_status,

      claim_available,

      vendor_name,
      contact_number,
      vendor_location,

      purchase_cost,
      claim_amount,

      tax_included,

      reminder_before,
      notify_to,
      notification_method,

      item_description,
      usage_notes,
      terms_conditions,

      warranty_card,
      invoice_file,
      additional_documents,

      created_by

    )

    VALUES (

      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?,
      ?, ?, ?,
      ?, ?,
      ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?

    )

    `,

    [

      data.warranty_number,

      data.item_title,
      data.category,
      data.brand,
      data.model,
      data.serial_no,

      data.vehicle_id || null,
      data.vehicle_no,
      data.odometer || 0,

      data.purchase_date || null,
      data.start_date || null,
      data.end_date || null,
      data.warranty_period,

      data.warranty_type,
      data.warranty_status,

      data.claim_available,

      data.vendor_name,
      data.contact_number,
      data.vendor_location,

      data.purchase_cost || 0,
      data.claim_amount || 0,

      data.tax_included,

      data.reminder_before,
      data.notify_to,
      data.notification_method,

      data.item_description,
      data.usage_notes,
      data.terms_conditions,

      data.warranty_card,
      data.invoice_file,
      data.additional_documents,

      data.created_by

    ]

  );

  return result;
};


// ======================================================
// GET ALL WARRANTIES
// ======================================================

const getWarranties = async () => {

  const [warranties] = await db.query(

    `

    SELECT *

    FROM warranties

    ORDER BY created_at DESC

    `
  );

  return warranties;
};


// ======================================================
// GET WARRANTY BY ID
// ======================================================

const getWarrantyById = async (id) => {

  const [warranty] = await db.query(

    `

    SELECT *

    FROM warranties

    WHERE id = ?

    `,

    [id]

  );

  return warranty[0];
};


module.exports = {

  createWarranty,
  getWarranties,
  getWarrantyById

};