const db = require('../config/db');


// ======================================================
// CREATE OLD TYRE
// ======================================================

const createOldTyre = async (data) => {
    await db.query(
  `
  DELETE FROM old_tyres
  WHERE old_tyre_number = ?
  `,
  [data.old_tyre_number]
);

  const [result] = await db.query(

    `

    INSERT INTO old_tyres (

      old_tyre_number,

      brand,

      model,

      tyre_size,

      material_type,

      vehicle_id,

      vehicle_number,

      last_position,

      removed_date,

      removal_reason,

      running_km,

      expected_life_km,

      remaining_tread_percent,

      tyre_status,

      store_location,

      notes

    )

    VALUES (

      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?

    )

    `,

    [

      data.old_tyre_number,

      data.brand,

      data.model,

      data.tyre_size,

      data.material_type,

      data.vehicle_id &&
      data.vehicle_id !== 'null'
        ? Number(data.vehicle_id)
        : null,

      data.vehicle_number,

      data.last_position,

      data.removed_date,

      data.removal_reason,

      data.running_km,

      data.expected_life_km,

      data.remaining_tread_percent,

      data.tyre_status,

      data.store_location,

      data.notes

    ]

  );

  return result;

};


// ======================================================
// GET ALL OLD TYRES
// ======================================================

const getAllOldTyres = async () => {

  const [rows] = await db.query(`

    SELECT 
      ot.*,
      COALESCE(t.vendor_name, '') AS vendor_name
    FROM old_tyres ot
    LEFT JOIN tyres t ON t.tyre_number = ot.old_tyre_number
    ORDER BY ot.created_at DESC

  `);

  return rows;

};

// ======================================================
// UPDATE OLD TYRE STATUS
// ======================================================

const updateOldTyreStatus = async (
  tyreNo,
  tyreStatus,
  storeLocation,
  remainingTreadPercent = null,
  notes = null
) => {

  let query = `
    UPDATE old_tyres
    SET
      tyre_status = ?,
      store_location = ?
  `;
  const params = [tyreStatus, storeLocation];

  if (remainingTreadPercent !== null && remainingTreadPercent !== undefined) {
    query += `, remaining_tread_percent = ?`;
    params.push(remainingTreadPercent);
  }

  if (notes !== null && notes !== undefined) {
    query += `, notes = ?`;
    params.push(notes);
  }

  query += ` WHERE old_tyre_number = ?`;
  params.push(tyreNo);

  const [result] = await db.query(query, params);

  return result;

};

module.exports = {

  createOldTyre,

  getAllOldTyres,
  updateOldTyreStatus

};