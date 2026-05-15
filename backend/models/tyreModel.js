const db = require('../config/db');


// ======================================================
// CREATE TYRE
// ======================================================

const createTyre = async (data) => {

  const [result] = await db.query(

    `

    INSERT INTO tyres (

      tyre_number,

      serial_no,

      brand,

      model,

      tyre_size,

      material_type,

      status,

      vehicle_id,

      vehicle_number,

      tyre_position,

      date_of_issue,

      fitted_odometer,

      expected_life_km,

      running_km,

      remaining_life_km,

      tyre_health,

      vendor_name,

      purchase_date,

      invoice_number,

      tyre_cost,

      tyre_files

    )

    VALUES (

      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?

    )

    `,

    [

      data.tyre_number,

      data.serial_no,

      data.brand,

      data.model,

      data.tyre_size,

      data.material_type,

      data.status,

      data.vehicle_id && data.vehicle_id !== 'null'
  ? Number(data.vehicle_id)
  : null,

      data.vehicle_number,

      data.tyre_position,

      data.date_of_issue,

      data.fitted_odometer,

      data.expected_life_km,

      data.running_km,

      data.remaining_life_km,

      data.tyre_health,

      data.vendor_name,

      data.purchase_date,

      data.invoice_number,

      data.tyre_cost,

      data.tyre_files

    ]

  );

  return result;

};


// ======================================================
// GET ALL TYRES
// ======================================================

const getAllTyres = async () => {

  const [rows] = await db.query(`

    SELECT *

    FROM tyres

    ORDER BY created_at DESC

  `);

  return rows;

};


module.exports = {

  createTyre,

  getAllTyres

};