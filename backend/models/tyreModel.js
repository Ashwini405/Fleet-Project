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

      Number.isFinite(Number(data.vehicle_id))
        ? Number(data.vehicle_id)
        : null,

      data.vehicle_number,

      data.tyre_position,

      data.date_of_issue,

      data.fitted_odometer,

      data.expected_life_km,

      data.running_km || 0,

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


// ======================================================
// GET IN STOCK TYRES
// ======================================================

const getInStockTyres = async () => {

  const [rows] = await db.query(`

    SELECT *

    FROM tyres

    WHERE status = 'In Stock'

    ORDER BY created_at DESC

  `);

  return rows;

};


// ======================================================
// MOUNT TYRE
// ======================================================

const mountTyre = async (data) => {

  // Check if it's a stock tyre first
  const [stockRows] = await db.query(
    `SELECT * FROM tyres WHERE tyre_number = ? AND status = 'In Stock'`,
    [data.tyre_number]
  );

  if (stockRows.length > 0) {
    // Mount directly from stock
    const [result] = await db.query(
      `UPDATE tyres
       SET status = 'Mounted',
           vehicle_id = ?,
           vehicle_number = ?,
           tyre_position = ?,
           date_of_issue = ?,
           fitted_odometer = ?,
           running_km = ?,
           tyre_health = 'Good'
       WHERE tyre_number = ?`,
      [
        data.vehicle_id,
        data.vehicle_number,
        data.tyre_position,
        data.date_of_issue,
        data.fitted_odometer,
        stockRows[0].running_km || 0,
        data.tyre_number
      ]
    );
    return result;
  }

  // Otherwise check old_tyres
  const [oldTyreRows] = await db.query(
    `SELECT * FROM old_tyres WHERE old_tyre_number = ?`,
    [data.tyre_number]
  );

  if (oldTyreRows.length === 0) {
    throw new Error('Tyre not found in stock or old tyres');
  }

  const oldTyre = oldTyreRows[0];

  const [result] = await db.query(
    `UPDATE tyres
     SET status = 'Mounted',
         vehicle_id = ?,
         vehicle_number = ?,
         tyre_position = ?,
         date_of_issue = ?,
         fitted_odometer = ?,
         running_km = ?,
         tyre_health = 'Good'
     WHERE tyre_number = ?`,
    [
      data.vehicle_id,
      data.vehicle_number,
      data.tyre_position,
      data.date_of_issue,
      data.fitted_odometer,
      oldTyre.running_km || 0,
      oldTyre.old_tyre_number
    ]
  );

  await db.query(
    `DELETE FROM old_tyres WHERE old_tyre_number = ?`,
    [oldTyre.old_tyre_number]
  );

  return result;
};

const getTyresByVehicle = async (vehicleId) => {

  // First get the vehicle_number for this id so we can match both ways
  const [vRows] = await db.query(
    `SELECT vehicle_no FROM vehicles WHERE id = ?`,
    [vehicleId]
  );

  const vehicleNumber = vRows[0]?.vehicle_no || null;

  const [rows] = await db.query(
    `SELECT * FROM tyres
     WHERE status = 'Mounted'
     AND (
       vehicle_id = ?
       OR vehicle_number = ?
     )`,
    [vehicleId, vehicleNumber]
  );

  return rows;
};

module.exports = {

  createTyre,
  getAllTyres,
  getInStockTyres,
  mountTyre,
  getTyresByVehicle

};