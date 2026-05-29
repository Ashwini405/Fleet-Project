const IncomeModel = require('../models/incomeModel');
const db = require('../config/db');

// =====================================================
// CREATE INCOME
// =====================================================

const createIncome = async (req, res) => {

  try {

    const body = req.body;

    // ============================================
    // VEHICLE DETAILS
    // ============================================

    const [vehicleRows] = await db.query(

      `SELECT *
       FROM vehicles
       WHERE id = ?`,

      [body.vehicle_id]

    );

    const vehicle = vehicleRows[0];

    // ============================================
    // TRIP DETAILS
    // ============================================

    let trip = null;

    if (body.trip_id) {

      const [tripRows] = await db.query(

        `SELECT *
         FROM trips
         WHERE id = ?`,

        [body.trip_id]

      );

      trip = tripRows[0];

    }

    // ============================================
    // GENERATE INCOME NUMBER
    // ============================================

    const incomeNumber =
      `INC-${Date.now()}`;

    // ============================================
    // CALCULATIONS
    // ============================================

    const amount =
      Number(body.amount || 0);

    const received =
      Number(body.received_amount || amount);

    const pending =
      amount - received;

    // ============================================
    // CREATE DATA
    // ============================================

    const data = {

      income_number: incomeNumber,

      income_category:
        body.income_category,

      vehicle_id:
        vehicle?.id || null,

      vehicle_number:
        vehicle?.vehicle_no || '',

      driver_id:
        trip?.driver_id || null,

      driver_name:
        trip?.driver_name || '',

      supervisor_id:
        trip?.supervisor_id || null,

      supervisor_name:
        trip?.supervisor_name || '',

      trip_id:
        trip?.id || null,

      trip_number:
        trip?.trip_id || '',

      route_from:
        trip?.source || '',

      route_to:
        trip?.destination || '',

      place_of_running:
        body.place_of_running,

      freight_start_date:
        body.freight_start_date,

      freight_end_date:
        body.freight_end_date,

      amount,

      received_amount:
        received,

      pending_amount:
        pending,

      payment_status:
        body.payment_status,

      payment_received_date:
        body.payment_received_date,

      payment_method:
        body.payment_method,

      bank_reference_number:
        body.bank_reference_number,

      description:
        body.description,

      remarks:
        body.remarks,

      created_by:
        body.created_by || 'Admin'

    };

    // ============================================
    // SAVE
    // ============================================

    const result =
      await IncomeModel.createIncome(data);

    res.status(201).json({

      success: true,

      message:
        'Income Entry Created Successfully',

      data: {

        id: result.insertId

      }

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};

// =====================================================
// GET ALL INCOME
// =====================================================

const getAllIncome = async (req, res) => {

  try {

    const income =
      await IncomeModel.getAllIncome();

    res.status(200).json({

      success: true,

      count: income.length,

      data: income

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};

// =====================================================
// GET SINGLE INCOME
// =====================================================

const getIncomeById = async (req, res) => {

  try {

    const income =
      await IncomeModel.getIncomeById(
        req.params.id
      );

    res.status(200).json({

      success: true,

      data: income

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};

// =====================================================
// GET COMPLETED TRIPS BY VEHICLE
// =====================================================

const getCompletedTripsByVehicle = async (req, res) => {

  try {

    const trips =
      await IncomeModel.getCompletedTripsByVehicle(
        req.params.vehicleId
      );

    res.status(200).json({

      success: true,

      count: trips.length,

      data: trips

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};

module.exports = {

  createIncome,
  getAllIncome,
  getIncomeById,
  getCompletedTripsByVehicle

};