const db = require('../config/db');


// ======================================================
// CREATE OLD TYRE
// ======================================================

const createOldTyre = async (data) => {

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

    SELECT *

    FROM old_tyres

    ORDER BY created_at DESC

  `);

  return rows;

};


module.exports = {

  createOldTyre,

  getAllOldTyres

};