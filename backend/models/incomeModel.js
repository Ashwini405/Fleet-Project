const db = require('../config/db');

const Income = {

  // =====================================================
  // CREATE INCOME
  // =====================================================

  createIncome: async (data) => {

    const [result] = await db.query(

      `INSERT INTO income_entries (

        income_number,
        income_category,

        vehicle_id,
        vehicle_number,

        driver_id,
        driver_name,

        supervisor_id,
        supervisor_name,

        trip_id,
        trip_number,

        route_from,
        route_to,
        place_of_running,

        freight_start_date,
        freight_end_date,

        amount,
        received_amount,
        pending_amount,

        payment_status,
        payment_received_date,

        payment_method,
        bank_reference_number,

        description,
        remarks,

        created_by

      ) VALUES (

        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?

      )`,

      [

        data.income_number,
        data.income_category,

        data.vehicle_id,
        data.vehicle_number,

        data.driver_id,
        data.driver_name,

        data.supervisor_id,
        data.supervisor_name,

        data.trip_id,
        data.trip_number,

        data.route_from,
        data.route_to,
        data.place_of_running,

        data.freight_start_date,
        data.freight_end_date,

        data.amount,
        data.received_amount,
        data.pending_amount,

        data.payment_status,
        data.payment_received_date,

        data.payment_method,
        data.bank_reference_number,

        data.description,
        data.remarks,

        data.created_by

      ]

    );

    return result;

  },

  // =====================================================
  // GET ALL INCOME
  // =====================================================

  getAllIncome: async () => {

    const [rows] = await db.query(`

      SELECT *
      FROM income_entries
      ORDER BY created_at DESC

    `);

    return rows;

  },

  // =====================================================
  // GET SINGLE INCOME
  // =====================================================

  getIncomeById: async (id) => {

    const [rows] = await db.query(

      `SELECT *
       FROM income_entries
       WHERE id = ?`,

      [id]

    );

    return rows[0];

  },

  // =====================================================
  // GET COMPLETED TRIPS BY VEHICLE
  // =====================================================

  getCompletedTripsByVehicle: async (vehicleId) => {

  const [rows] = await db.query(

    `SELECT *
     FROM trips
     WHERE vehicle_id = ?
     AND trip_status IN ('Closed', 'Completed')
     ORDER BY created_at DESC`,

    [vehicleId]

  );

  return rows;

}

};

module.exports = Income;