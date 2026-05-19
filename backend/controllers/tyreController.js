const TyreModel = require('../models/tyreModel');
const db = require('../config/db');

// ======================================================
// CREATE TYRE
// ======================================================

const createTyre = async (req, res) => {

  try {

    const body = req.body;

    const tyre_files = req.files
      ? JSON.stringify(req.files.map(file => file.filename))
      : JSON.stringify([]);

    const data = { ...body, tyre_files };
    const result = await TyreModel.createTyre(data);

    res.status(201).json({
      success: true,
      message: 'Tyre Registered Successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('CREATE TYRE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// GET ALL TYRES
// ======================================================

const getAllTyres = async (req, res) => {
  try {
    const tyres = await TyreModel.getAllTyres();
    res.status(200).json({ success: true, count: tyres.length, data: tyres });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// GET MOUNTED TYRES BY VEHICLE
// ======================================================

const getMountedTyresByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM tyres WHERE vehicle_id = ? AND status = 'Mounted' ORDER BY tyre_position ASC`,
      [vehicleId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('GET MOUNTED TYRES ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// GET AVAILABLE TYRES FOR REPLACEMENT (Inventory + Reusable)
// ======================================================

const getAvailableReplacementTyres = async (req, res) => {
  try {
    // Inventory tyres (status = 'In Stock')
    const [inventoryTyres] = await db.query(
      `SELECT id, tyre_number, brand, model, tyre_size, tyre_cost, 'Inventory' AS source
       FROM tyres WHERE status = 'In Stock' ORDER BY tyre_number ASC`
    );

    // Reusable old tyres (tyre_status = 'Reusable')
    const [reusableTyres] = await db.query(
      `SELECT id, old_tyre_number AS tyre_number, brand, model, tyre_size, 0 AS tyre_cost, 'Reusable' AS source
       FROM old_tyres WHERE tyre_status = 'Reusable' ORDER BY old_tyre_number ASC`
    );

    res.json({
      success: true,
      data: { inventory: inventoryTyres, reusable: reusableTyres }
    });
  } catch (error) {
    console.error('GET REPLACEMENT TYRES ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// PROCESS TYRE SERVICE (atomic transaction)
// ======================================================

const processTyreService = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      repair_id,
      vehicle_id,
      vehicle_no,
      axle_position,
      old_tyre_id,
      old_tyre_number,
      issue_type,
      action_taken,
      current_tread_percent,
      current_running_km,
      tyre_health,
      // Replacement fields
      replacement_source,
      replacement_tyre_id,
      replacement_tyre_number,
      mount_odometer,
      mount_date,
      // Old tyre decision
      old_tyre_decision,
      old_tyre_store_location,
      // Cost
      tyre_repair_cost,
      tyre_replacement_cost,
      retreading_cost,
    } = req.body;

    const today = mount_date || new Date().toISOString().split('T')[0];

    // ── A. REMOVE OLD TYRE from active layout ──────────────────────────────
    if (old_tyre_id) {
      await conn.query(
        `UPDATE tyres SET status = 'Removed', vehicle_id = NULL, vehicle_number = NULL,
         tyre_position = NULL, running_km = ?, tyre_health = ? WHERE id = ?`,
        [current_running_km || 0, tyre_health || 'Critical', old_tyre_id]
      );
    }

    // ── B. CREATE OLD TYRE RECORD ──────────────────────────────────────────
    if (old_tyre_id && old_tyre_decision) {
      const statusMap = {
        'Move To Old Stock': 'Old Stock',
        'Send To Retreading': 'Retreading',
        'Mark As Scrap': 'Scrap',
        'Keep As Reusable': 'Reusable',
      };

      // Get old tyre details
      const [[tyre]] = await conn.query(`SELECT * FROM tyres WHERE id = ?`, [old_tyre_id]);

      await conn.query(
        `INSERT INTO old_tyres
         (old_tyre_number, brand, model, tyre_size, material_type, vehicle_id, vehicle_number,
          last_position, removed_date, removal_reason, running_km, expected_life_km,
          remaining_tread_percent, tyre_status, store_location, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          old_tyre_number || tyre?.tyre_number,
          tyre?.brand, tyre?.model, tyre?.tyre_size, tyre?.material_type,
          vehicle_id, vehicle_no, axle_position, today,
          issue_type, current_running_km || 0, tyre?.expected_life_km || 0,
          current_tread_percent || 0,
          statusMap[old_tyre_decision] || 'Old Stock',
          old_tyre_store_location || null,
          `Removed via repair service. Action: ${action_taken}`
        ]
      );
    }

    // ── C. MOUNT REPLACEMENT TYRE ──────────────────────────────────────────
    if (action_taken === 'Replace Tyre' && replacement_tyre_id) {
      if (replacement_source === 'Inventory') {
        await conn.query(
          `UPDATE tyres SET status = 'Mounted', vehicle_id = ?, vehicle_number = ?,
           tyre_position = ?, fitted_odometer = ?, date_of_issue = ?, running_km = 0
           WHERE id = ?`,
          [vehicle_id, vehicle_no, axle_position, mount_odometer || 0, today, replacement_tyre_id]
        );
      } else if (replacement_source === 'Reusable') {
        // Mount from old_tyres reusable stock — re-register as active tyre
        const [[reusable]] = await conn.query(`SELECT * FROM old_tyres WHERE id = ?`, [replacement_tyre_id]);
        if (reusable) {
          await conn.query(
            `INSERT INTO tyres (tyre_number, brand, model, tyre_size, material_type, status,
             vehicle_id, vehicle_number, tyre_position, fitted_odometer, date_of_issue, running_km, tyre_files)
             VALUES (?, ?, ?, ?, ?, 'Mounted', ?, ?, ?, ?, ?, 0, '[]')`,
            [reusable.old_tyre_number, reusable.brand, reusable.model, reusable.tyre_size,
             reusable.material_type, vehicle_id, vehicle_no, axle_position,
             mount_odometer || 0, today]
          );
          // Remove from old_tyres
          await conn.query(`DELETE FROM old_tyres WHERE id = ?`, [replacement_tyre_id]);
        }
      }
    }

    // ── D. TYRE LIFECYCLE HISTORY ──────────────────────────────────────────
    await conn.query(
      `INSERT INTO tyre_service_history
       (repair_id, vehicle_id, vehicle_no, axle_position, tyre_number, issue_type,
        action_taken, tyre_health, tread_percent, running_km, replacement_tyre_number,
        replacement_source, tyre_repair_cost, tyre_replacement_cost, retreading_cost, service_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repair_id || null, vehicle_id, vehicle_no, axle_position,
        old_tyre_number, issue_type, action_taken, tyre_health,
        current_tread_percent || 0, current_running_km || 0,
        replacement_tyre_number || null, replacement_source || null,
        tyre_repair_cost || 0, tyre_replacement_cost || 0, retreading_cost || 0, today
      ]
    );

    await conn.commit();
    res.json({ success: true, message: 'Tyre service processed successfully' });

  } catch (error) {
    await conn.rollback();
    console.error('TYRE SERVICE ERROR:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  } finally {
    conn.release();
  }
};


// ======================================================
// GET TYRE SERVICE HISTORY BY TYRE NUMBER
// ======================================================

const getTyreServiceHistory = async (req, res) => {
  try {
    const { tyreNumber } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM tyre_service_history WHERE tyre_number = ? ORDER BY service_date DESC`,
      [tyreNumber]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('GET TYRE HISTORY ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ======================================================
// GET IN STOCK TYRES
// ======================================================

const getInStockTyres = async (req, res) => {

  try {

    const tyres =
      await TyreModel.getInStockTyres();

    res.status(200).json({

      success: true,

      count: tyres.length,

      data: tyres

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};

// ======================================================
// MOUNT TYRE
// ======================================================

const mountTyre = async (req, res) => {

  try {

    const {

      tyre_number,

      vehicle_id,

      vehicle_number,

      tyre_position,

      fitted_odometer,

      date_of_issue,

      running_km,

      status

    } = req.body;

    await TyreModel.mountTyre({

      tyre_number,

      vehicle_id,

      vehicle_number,

      tyre_position,

      fitted_odometer,

      date_of_issue,

      running_km,

      status

    });

    res.status(200).json({

      success: true,

      message: 'Tyre Mounted Successfully'

    });

  } catch (error) {

    console.error(

      'MOUNT TYRE ERROR:',
      error

    );

    res.status(500).json({

      success: false,

      message: 'Server Error'

    });

  }

};


const getTyresByVehicle = async (req, res) => {
  try {
    const tyres = await TyreModel.getTyresByVehicle(req.params.vehicleId);
    res.status(200).json({ success: true, data: tyres });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createTyre,
  getAllTyres,
  getInStockTyres,
  mountTyre,
  getTyresByVehicle,
  getMountedTyresByVehicle,
  getAvailableReplacementTyres,
  processTyreService,
  getTyreServiceHistory,
};