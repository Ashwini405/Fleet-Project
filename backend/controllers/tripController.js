const Trip = require('../models/tripModel');
const db = require('../config/db');
const lifecycle = require('../services/maintenanceLifecycleService');

// Today's date in India (the server may run in UTC), as YYYY-MM-DD.
const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// Only the Admin role may give a trip a date before today. The role is read
// from the users table so a role change applies immediately.
async function isAdminUser(req) {
  if (!req.user?.id) return false;
  const [[row]] = await db.query(
    `SELECT COALESCE(r.role_name, u.role) AS role
     FROM users u LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?`,
    [req.user.id]
  );
  return String(row?.role || '').trim().toLowerCase() === 'admin';
}

async function checkTripDate(req, tripDate) {
  if (!tripDate) return null;
  const date = String(tripDate).slice(0, 10);
  if (date < todayIST() && !(await isAdminUser(req))) {
    return 'Only an admin can create a trip with a past date. Use today\'s date.';
  }
  return null;
}

const wallet = require('../services/supervisorWalletService');

const totalAdvanceOf = (t) =>
  (Number(t.driver_advance) || 0) + (Number(t.hamali_advance) || 0) + (Number(t.other_advance) || 0);

const advanceDescription = (t) => [
  Number(t.driver_advance) > 0 && `Driver ₹${Number(t.driver_advance)}`,
  Number(t.hamali_advance) > 0 && `Hamali ₹${Number(t.hamali_advance)}`,
  Number(t.other_advance) > 0 && `Other ₹${Number(t.other_advance)}`,
].filter(Boolean).join(' · ') + (t.destination ? ` → ${t.destination}` : '');

// Multipart requests send every field as text; turn "" back into NULL.
function normalizeTripBody(body) {
  const data = { ...body };
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === 'null' || data[key] === 'undefined') data[key] = null;
  });
  return data;
}


// ✅ CREATE TRIP
const createTrip = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const tripData = req.is('multipart/form-data') ? normalizeTripBody(req.body) : req.body;

    const dateError = await checkTripDate(req, tripData.trip_date);
    if (dateError) return res.status(403).json({ success: false, message: dateError });

    // Invoice uploaded at trip generation (given before loading)
    if (req.file) tripData.invoice_file = req.file.filename;

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

    if (tripData.vehicle_id) await lifecycle.syncVehicleOperationalStatus(tripData.vehicle_id);

    // ── Deduct total advance from supervisor wallet ──────────────────────
    // The wallet may go below zero (client requirement). A draft is not a
    // trip yet: its advance is deducted when the draft is generated (updateTrip).
    const totalAdvance = totalAdvanceOf(tripData);

    if (tripData.trip_status !== 'Draft' && tripData.supervisor_id && totalAdvance > 0) {
      await wallet.post({
        supervisorId: tripData.supervisor_id,
        amount: -totalAdvance,
        type: wallet.TYPES.TRIP_ADVANCE,
        tripId: newTrip.insertId,
        tripCode: tripData.trip_id,
        vehicleNo: tripData.truck_no,
        description: advanceDescription(tripData),
        createdBy: req.user?.username,
      });
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

// ✅ GET SINGLE TRIP
const getTripById = async (req, res) => {
  try {
    const id = req.params.id;
    const trip = await Trip.getById(id);

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
    console.error('getTripById error:', error);
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

    const data = req.is('multipart/form-data') ? normalizeTripBody(req.body) : { ...req.body };

    // A draft keeps the date rule: no past dates unless admin (only when the date changes)
    const existingDate = existing.trip_date ? new Date(existing.trip_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : null;
    if (data.trip_date && String(data.trip_date).slice(0, 10) !== existingDate) {
      const dateError = await checkTripDate(req, data.trip_date);
      if (dateError) return res.status(403).json({ success: false, message: dateError });
    }

    if (req.file) data.invoice_file = req.file.filename;

    await Trip.update(id, data);
    const updated = await Trip.getById(id);

    // Draft generated into a real trip → deduct its advance now (once).
    if (existing.trip_status === 'Draft' && updated?.trip_status && updated.trip_status !== 'Draft') {
      const advance = totalAdvanceOf(updated);
      if (updated.supervisor_id && advance > 0) {
        await wallet.post({
          supervisorId: updated.supervisor_id,
          amount: -advance,
          type: wallet.TYPES.TRIP_ADVANCE,
          tripId: updated.id,
          tripCode: updated.trip_id,
          vehicleNo: updated.truck_no,
          description: advanceDescription(updated),
          createdBy: req.user?.username,
        });
      }
    }
    if (existing.vehicle_id) await lifecycle.syncVehicleOperationalStatus(existing.vehicle_id);
    if (updated?.vehicle_id && updated.vehicle_id !== existing.vehicle_id) await lifecycle.syncVehicleOperationalStatus(updated.vehicle_id);

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
    const tripRow = await Trip.getByIdAny(tripId);
    const tripKeys = [...new Set([tripId, tripRow?.id, tripRow?.trip_id].filter(value => value !== undefined && value !== null))];
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
    const tripRow = await Trip.getByIdAny(tripId);
    const tripKeys = [...new Set([tripId, tripRow?.id, tripRow?.trip_id].filter(value => value !== undefined && value !== null))];
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

// ✅ UPDATE TRIP STATUS
// (The vehicle's current odometer is computed live from fuel entries and
// trip readings in vehicleModel — nothing to store here.)
const updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Trip.update(id, { trip_status: status });

    const trip = await Trip.getById(id);
    if (trip?.vehicle_id) await lifecycle.syncVehicleOperationalStatus(trip.vehicle_id);

    // ── On Closed: settle supervisor wallet (refund unspent advance) ─────
    // Once per trip — closing again must not settle twice.
    if (status === 'Closed' && trip?.supervisor_id && !(await wallet.hasTripSettlement(trip.id))) {
      const [[fuelRow]] = await db.query(
        `SELECT COALESCE(SUM(quantity * rate), 0) AS fuel_cost FROM trip_fuel WHERE trip_id = ?`,
        [trip.id]
      );
      const [[expRow]] = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS exp_cost FROM trip_expenses WHERE trip_id IN (?, ?)`,
        [String(trip.id), String(trip.trip_id)]
      );
      // Expenses the supervisor paid from the wallet were already deducted
      // when recorded, so they are not part of the driver's advance spend.
      const [[financeExpRow]] = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS exp_cost
         FROM expense_entries
         WHERE trip_id = ? AND entry_status != 'Deleted'
           AND COALESCE(payment_method, '') != 'Supervisor Wallet'`,
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
        await wallet.post({
          supervisorId: trip.supervisor_id,
          amount: refund,
          type: wallet.TYPES.SETTLEMENT,
          tripId: trip.id,
          tripCode: trip.trip_id,
          vehicleNo: trip.truck_no,
          description: refund > 0
            ? `Unspent advance returned (advance ₹${totalAdvance} − spent ₹${totalSpent})`
            : `Trip spend above advance (advance ₹${totalAdvance} − spent ₹${totalSpent})`,
          createdBy: req.user?.username,
        });
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
