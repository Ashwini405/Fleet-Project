const Trip = require('../models/tripModel');
const db = require('../config/db');


// ✅ CREATE TRIP
const createTrip = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const tripData = req.body;

    const newTrip = await Trip.create(tripData);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { id: newTrip.insertId }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


// ✅ GET ALL
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.getAll();

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

const addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const expenseData = req.body;

    const result = await Trip.addExpense(tripId, expenseData);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

const addFuel = async (req, res) => {
  try {
    const { tripId } = req.params;
    const fuelData = req.body;

    const result = await Trip.addFuel(tripId, fuelData);

    res.status(201).json({
      success: true,
      message: 'Fuel entry added successfully',
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// ✅ GET BY ID
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.getById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trip
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


// ✅ UPDATE
const updateTrip = async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await Trip.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    await Trip.update(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


// ✅ DELETE
const deleteTrip = async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await Trip.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    await Trip.delete(id);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    const expenses = await Trip.getExpenses(tripId);

    res.status(200).json({
      success: true,
      data: expenses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

const getFuel = async (req, res) => {
  try {
    const { tripId } = req.params;

    const fuel = await Trip.getFuel(tripId);

    res.status(200).json({
      success: true,
      data: fuel
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// ✅ UPDATE TRIP STATUS
const updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Trip.update(id, { trip_status: status });

    res.json({
      success: true,
      message: 'Status updated'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const getTripsByVehicle = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT trip_id FROM trips WHERE vehicle_id = ?',
      [req.params.vehicleId]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addExpense,   // ✅ ADD
  addFuel,
  getExpenses,   // ✅ ADD
  getFuel,
  updateTripStatus,
  getTripsByVehicle
};