const Trip = require('../models/tripModel');
const db = require('../config/db');
const lifecycle = require('../services/maintenanceLifecycleService');


// ✅ CREATE TRIP
const createTrip = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const tripData = req.body;

    // ── Block vehicles under repair ──────────────────────────────────────
    if (tripData.vehicle_id) {
      const [[vehicle]] = await db.query(
        'SELECT vehicle_status, vehicle_no FROM vehicles WHERE id = ?',
        [tripData.vehicle_id]
      );
      const [blockingDefects] = await db.query(
        `
          SELECT id, issue_type, severity, priority, status
          FROM inspection_defects
          WHERE vehicle_id = ?
            AND status IN ('Open', 'In Progress')
        `,
        [tripData.vehicle_id]
      );
      const criticalDefects = blockingDefects.filter(lifecycle.isCriticalDefect);

      if (criticalDefects.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle unavailable due to critical inspection defects'
        });
      }

      if (vehicle?.vehicle_status === 'under_repair') {
        return res.status(400).json({
          success: false,
          message: `Vehicle ${vehicle.vehicle_no} is currently under repair and cannot be assigned to a trip.`
        });
      }
    }

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


// ✅ SOFT DELETE — blocks active trips, keeps fuel/expense records intact
const deleteTrip = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Trip.getByIdAny(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (['Started', 'In Transit'].includes(existing.trip_status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete an active trip (status: ${existing.trip_status}). End the trip first.`
      });
    }

    await Trip.softDelete(id);

    res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
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

// ✅ UPDATE TRIP STATUS — on Completed, update vehicle odometer
const updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Trip.update(id, { trip_status: status });

    // When a trip is completed, push the closing odometer to the vehicle
    if (status === 'Completed') {
      const trip = await Trip.getById(id);
      if (trip?.vehicle_id && trip?.closing_km) {
        await db.query(
          `UPDATE vehicles SET current_odometer = GREATEST(IFNULL(current_odometer,0), ?) WHERE id = ?`,
          [trip.closing_km, trip.vehicle_id]
        );
      }
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const getTripsByVehicle = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT trip_id FROM trips WHERE vehicle_id = ? AND is_deleted = 0',
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

const uploadDocument = async (req, res) => {
  try {
    const tripId = req.params.tripId;   // ✅ FIXED
    const { type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileName = req.file.filename;

    let column = '';

    if (type === 'E-Way Bill') column = 'eway_bill_file';
    else if (type === 'Invoice') column = 'invoice_file';
    else if (type === 'Delivery Proof (POD)') column = 'pod_file';

    if (!column) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    await db.query(
      `UPDATE trips SET ${column} = ? WHERE trip_id = ?`,
      [fileName, tripId]
    );

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileName
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
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
  getTripsByVehicle,
  uploadDocument
};
