const Trip = require('../models/tripModel');
const db = require('../config/db');
const lifecycle = require('../services/maintenanceLifecycleService');


// ✅ CREATE TRIP
const createTrip = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const tripData = req.body;

    // Auto-generate serial trip ID
    const [[lastTrip]] = await db.query('SELECT trip_id FROM trips ORDER BY id DESC LIMIT 1');
    let nextNum = 1001;
    if (lastTrip?.trip_id) {
      const match = lastTrip.trip_id.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    tripData.trip_id = `TRIP-${nextNum}`;

    // Sanitize integer FK fields — empty string '' causes MySQL integer error
    const intOrNull = (v) => (v === '' || v === null || v === undefined) ? null : Number(v) || null;
    tripData.driver_id     = intOrNull(tripData.driver_id);
    tripData.supervisor_id = intOrNull(tripData.supervisor_id);
    tripData.station_id    = intOrNull(tripData.station_id);
    tripData.vehicle_id    = intOrNull(tripData.vehicle_id);

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

    // ── Deduct total advance from supervisor wallet ──────────────────────
    const totalAdvance =
      (Number(tripData.driver_advance)  || 0) +
      (Number(tripData.hamali_advance)  || 0) +
      (Number(tripData.other_advance)   || 0);

    if (tripData.supervisor_id && totalAdvance > 0) {
      await db.query(
        `UPDATE supervisors SET wallet_balance = wallet_balance - ? WHERE id = ?`,
        [totalAdvance, tripData.supervisor_id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { id: newTrip.insertId, trip_id: tripData.trip_id }
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

const updateExpense = async (req, res) => {
  try {
    const result = await Trip.updateExpense(req.params.tripId, req.params.expenseId, req.body);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Trip expense not found' });
    res.json({ success: true, message: 'Trip expense updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update trip expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const result = await Trip.deleteExpense(req.params.tripId, req.params.expenseId);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Trip expense not found' });
    res.json({ success: true, message: 'Trip expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete trip expense' });
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
    const [[tripRow]] = await db.query('SELECT id, trip_id AS trip_code FROM trips WHERE id = ? OR trip_id = ?', [tripId, tripId]);
    const tripKeys = [...new Set([tripId, tripRow?.id, tripRow?.trip_code].filter(value => value !== undefined && value !== null))];
    let tripExpenses = [];
    if (tripKeys.length) {
      const placeholders = tripKeys.map(() => '?').join(',');
      const [rows] = await db.query(
        `SELECT * FROM trip_expenses WHERE trip_id IN (${placeholders}) ORDER BY created_at DESC`,
        tripKeys
      );
      tripExpenses = rows;
    }

    // expense_entries table (Finance module) — match by numeric trip id
    let financeExpenses = [];
    if (tripRow) {
      const [rows] = await db.query(
        `SELECT id, expense_category AS type, expense_category, amount, description AS notes, description,
          expense_date, expense_date AS date, expense_date AS created_at,
          vendor_payee, payment_method, payment_status, vehicle_id, vehicle_number,
                trip_id, trip_number, created_by, created_at AS recorded_at, attachment
         FROM expense_entries WHERE trip_id = ? AND entry_status != 'Deleted'`,
        [tripRow.id]
      );
      financeExpenses = rows.map(r => ({ ...r, _source: 'finance' }));
    }

    res.status(200).json({
      success: true,
      data: [...tripExpenses, ...financeExpenses]
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
    const [[tripRow]] = await db.query('SELECT id, trip_id AS trip_code FROM trips WHERE id = ? OR trip_id = ?', [tripId, tripId]);
    const tripKeys = [...new Set([tripId, tripRow?.id, tripRow?.trip_code].filter(value => value !== undefined && value !== null))];
    const placeholders = tripKeys.map(() => '?').join(',');
    const [legacyFuel] = tripKeys.length
      ? await db.query(`SELECT * FROM trip_fuel WHERE trip_id IN (${placeholders}) ORDER BY created_at DESC`, tripKeys)
      : [[]];
    let fuel = [];
    if (tripRow?.id) {
      const [canonicalFuel] = await db.query(
        `SELECT f.*, v.vehicle_no, s.full_name AS supervisor_name
         FROM fuel_entries f
         LEFT JOIN vehicles v ON f.vehicle_id = v.id
         LEFT JOIN supervisors s ON v.supervisor_id = s.id
         WHERE f.trip_id = ?
         ORDER BY f.date DESC, f.created_at DESC`,
        [tripRow.id]
      );
      fuel = canonicalFuel.length > 0 ? canonicalFuel : legacyFuel;
    } else {
      fuel = legacyFuel;
    }

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

    const trip = await Trip.getById(id);

    // ── On Completed: push closing odometer to vehicle ───────────────────
    if (status === 'Completed' && trip?.vehicle_id && trip?.closing_km) {
      await db.query(
        `UPDATE vehicles SET current_odometer = GREATEST(IFNULL(current_odometer,0), ?) WHERE id = ?`,
        [trip.closing_km, trip.vehicle_id]
      );
    }

    // ── On Closed: settle supervisor wallet (refund unspent advance) ─────
    if (status === 'Closed' && trip?.supervisor_id) {
      const [[fuelRow]] = await db.query(
        `SELECT COALESCE(SUM(quantity * rate), 0) AS fuel_cost FROM trip_fuel WHERE trip_id = ?`,
        [trip.id]
      );
      const [[expRow]] = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS exp_cost FROM trip_expenses WHERE trip_id IN (?, ?)`,
        [String(trip.id), String(trip.trip_id)]
      );
      const [[financeExpRow]] = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS exp_cost
         FROM expense_entries
         WHERE trip_id = ? AND entry_status != 'Deleted'`,
        [trip.id]
      );
      const totalAdvance =
        (Number(trip.driver_advance) || 0) +
        (Number(trip.hamali_advance) || 0) +
        (Number(trip.other_advance)  || 0);
      const totalSpent = Number(fuelRow.fuel_cost) + Number(expRow.exp_cost) + Number(financeExpRow.exp_cost);
      const refund = totalAdvance - totalSpent;

      // refund > 0 → driver returned cash, add back to wallet
      // refund < 0 → supervisor paid extra, deduct more from wallet
      if (refund !== 0) {
        await db.query(
          `UPDATE supervisors SET wallet_balance = wallet_balance + ? WHERE id = ?`,
          [refund, trip.supervisor_id]
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
  updateExpense,
  deleteExpense,
  addFuel,
  getExpenses,   // ✅ ADD
  getFuel,
  updateTripStatus,
  getTripsByVehicle,
  uploadDocument
};
