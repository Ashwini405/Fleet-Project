const Fuel = require('../models/fuelModel');
const Fastag = require('../models/fastagModel');
const db = require('../config/db');

// ✅ CREATE FUEL ENTRY
const createFuel = async (req, res) => {
  try {
    const {
      trip_id, vehicle_id, vehicle_no, date,
      fuel_type, station_name, payment_method,
      driver_name, previous_odo, expected_mileage, tank_capacity,
      current_odo, distance, quantity, rate, mileage,
      bill_number, full_tank, vendor, vendor_type,
      location, filled_by, remarks
    } = req.body;

    const receipt_files = (req.files || []).map(file => file.filename);
    const total_cost = Number(quantity) * Number(rate);
    let fastag_account_id = null;

    if (payment_method === 'FASTag Wallet') {
      const account = await Fastag.getAccountByVehicle(vehicle_id);
      if (!account) {
        return res.status(400).json({
          success: false,
          message: 'This vehicle has no linked FASTag account. Create/link the FASTag account first.',
        });
      }
      fastag_account_id = account.id;
    }

    const fuelData = {
      trip_id: trip_id || null,
      vehicle_id: vehicle_id || null,
      vehicle_no: vehicle_no || null,
      date: date || null,
      fuel_type: fuel_type || null,
      station_name: station_name || null,
      payment_method: payment_method || null,
      fastag_account_id,
      driver_name: driver_name || null,
      previous_odo: previous_odo || null,
      expected_mileage: expected_mileage || null,
      tank_capacity: tank_capacity || null,
      current_odo: current_odo || null,
      distance: distance || null,
      quantity: quantity || 0,
      rate: rate || 0,
      total_cost: total_cost || 0,
      mileage: mileage || null,
      bill_number: bill_number || null,
      full_tank: full_tank === true || full_tank === 'true' || full_tank === '1' ? 1 : 0,
      vendor: vendor || null,
      vendor_type: vendor_type || null,
      location: location || null,
      filled_by: filled_by || null,
      remarks: remarks || null,
      receipt_files: receipt_files.length ? JSON.stringify(receipt_files) : null
    };

    const result = await Fuel.create(fuelData);

    // FASTag Wallet fuel usage is included in the monthly FASTag report.
    // It must not reduce the account balance once per trip.

    // ── Driver Advance: deduct from supervisor wallet ─────────────────────────
    if (payment_method === 'Driver Advance' && trip_id) {
      const [tripRows] = await db.query(
        'SELECT supervisor_id FROM trips WHERE id = ?', [trip_id]
      );
      if (tripRows.length && tripRows[0].supervisor_id) {
        await db.query(
          'UPDATE supervisors SET wallet_balance = wallet_balance - ? WHERE id = ?',
          [total_cost, tripRows[0].supervisor_id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Fuel entry added successfully",
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error("CREATE FUEL ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ GET ALL FUEL ENTRIES
const getFuelEntries = async (req, res) => {
  try {
    const data = await Fuel.getAll();

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET ALL FUEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ GET BY VEHICLE
const getFuelByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const data = await Fuel.getByVehicle(vehicleId);

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET FUEL BY VEHICLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ GET BY TRIP (MOST IMPORTANT)
const getFuelByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const data = await Fuel.getByTrip(tripId);

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("GET FUEL BY TRIP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ UPDATE FUEL ENTRY
const updateFuel = async (req, res) => {
  try {
    const { id } = req.params;
    let { quantity, rate } = req.body;

    // 🔥 Recalculate total cost if quantity or rate is updated
    if (quantity && rate) {
      req.body.total_cost = quantity * rate;
    }

    if (req.body.full_tank !== undefined) {
      req.body.full_tank = req.body.full_tank === true || req.body.full_tank === 'true' || req.body.full_tank === '1' ? 1 : 0;
    }

    if (req.files?.length || req.body.existing_receipt_files !== undefined) {
      let existingFiles = [];
      try {
        existingFiles = JSON.parse(req.body.existing_receipt_files || '[]');
      } catch (_) {}
      req.body.receipt_files = JSON.stringify([
        ...existingFiles,
        ...(req.files || []).map(file => file.filename)
      ]);
    }
    delete req.body.existing_receipt_files;

    await Fuel.update(id, req.body);

    res.json({
      success: true,
      message: "Fuel entry updated successfully"
    });

  } catch (error) {
    console.error("UPDATE FUEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// ✅ DELETE FUEL ENTRY
const deleteFuel = async (req, res) => {
  try {
    const { id } = req.params;
    await Fuel.delete(id);

    res.json({
      success: true,
      message: "Fuel entry deleted successfully"
    });

  } catch (error) {
    console.error("DELETE FUEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = {
  createFuel,
  getFuelEntries,
  getFuelByVehicle,
  getFuelByTrip,
  updateFuel,
  deleteFuel
};